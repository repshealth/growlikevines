// Project Reset API, running in the Worker (see worker.js) with a D1 database.
// Bindings: DB = the D1 database (wrangler.jsonc), SETUP_KEY = secret used once to create Ellis's coach account.

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('coach','client')),
    pw_hash TEXT NOT NULL,
    pw_salt TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    form TEXT,
    targets TEXT,
    start_date TEXT,
    created_at TEXT NOT NULL,
    assigned_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS logs (
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (user_id, date)
  )`,
  `CREATE TABLE IF NOT EXISTS notes (
    client_id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`
];

let schemaReady = false;
async function ensureSchema(db) {
  if (schemaReady) return;
  await db.batch(SCHEMA.map(q => db.prepare(q)));
  schemaReady = true;
}

const SESSION_DAYS = 60;
const COOKIE = "pr_session";
const enc = new TextEncoder();

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...headers } });
const err = (status, message) => json({ error: message }, status);

const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const randomId = (bytes = 16) => {
  const a = crypto.getRandomValues(new Uint8Array(bytes));
  return [...a].map(x => x.toString(16).padStart(2, "0")).join("");
};
async function sha256(s) {
  return b64(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}
async function hashPassword(password, saltB64) {
  const salt = saltB64 ? Uint8Array.from(atob(saltB64), c => c.charCodeAt(0)) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, key, 256);
  return { hash: b64(bits), salt: b64(salt) };
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const londonToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const cleanEmail = e => String(e || "").trim().toLowerCase();
const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

async function readBody(request) {
  const text = await request.text();
  if (text.length > 200000) throw new Error("too large");
  return text ? JSON.parse(text) : {};
}

function cookieFor(token, request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`;
}
const clearCookie = `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

async function startSession(db, userId, request) {
  const token = randomId(32);
  await db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(await sha256(token), userId, Date.now() + SESSION_DAYS * 86400000).run();
  return cookieFor(token, request);
}
async function currentUser(db, request) {
  const m = (request.headers.get("cookie") || "").match(new RegExp(`(?:^|; )${COOKIE}=([a-f0-9]+)`));
  if (!m) return null;
  const row = await db.prepare(
    "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?"
  ).bind(await sha256(m[1]), Date.now()).first();
  return row || null;
}

// What the browser is allowed to see about a user
const publicUser = u => ({
  id: u.id, email: u.email, name: u.name, role: u.role, status: u.status,
  form: u.form ? JSON.parse(u.form) : null,
  targets: u.targets ? JSON.parse(u.targets) : null,
  start_date: u.start_date, created_at: u.created_at, assigned_at: u.assigned_at
});

async function getSettings(db) {
  const row = await db.prepare("SELECT value FROM settings WHERE key = 'weeks'").first();
  return { weeks: row ? JSON.parse(row.value) : null };
}
async function logsFor(db, userId) {
  const { results } = await db.prepare("SELECT date, data FROM logs WHERE user_id = ?").bind(userId).all();
  const out = {};
  for (const r of results) out[r.date] = JSON.parse(r.data);
  return out;
}

export async function onRequest(context) {
  const { request, env, params } = context;
  if (!env.DB) return err(500, "The D1 database isn't bound. Check the d1_databases entry in wrangler.jsonc.");
  const db = env.DB;
  await ensureSchema(db);

  const path = "/" + [].concat(params.path || []).join("/");
  const method = request.method;
  // Same-origin only for anything that changes data
  if (method !== "GET") {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return err(403, "Bad origin");
  }

  try {
    // ---------- public ----------
    if (path === "/status" && method === "GET") {
      const coach = await db.prepare("SELECT id FROM users WHERE role = 'coach' LIMIT 1").first();
      return json({ needsSetup: !coach });
    }

    if (path === "/setup" && method === "POST") {
      const b = await readBody(request);
      if (!env.SETUP_KEY) return err(500, "SETUP_KEY isn't set. Add it as a secret in the Worker's Settings, Variables and Secrets.");
      if (!b.key || !safeEqual(String(b.key), String(env.SETUP_KEY))) return err(403, "That setup key isn't right.");
      const exists = await db.prepare("SELECT id FROM users WHERE role = 'coach' LIMIT 1").first();
      if (exists) return err(409, "The coach account already exists. Log in instead.");
      const email = cleanEmail(b.email);
      if (!validEmail(email)) return err(400, "Enter a valid email.");
      if (String(b.password || "").length < 8) return err(400, "Use a password of at least 8 characters.");
      const { hash, salt } = await hashPassword(String(b.password));
      const id = randomId();
      await db.prepare("INSERT INTO users (id, email, name, role, pw_hash, pw_salt, status, created_at) VALUES (?, ?, ?, 'coach', ?, ?, 'active', ?)")
        .bind(id, email, String(b.name || "Coach").slice(0, 80), hash, salt, new Date().toISOString()).run();
      return json({ ok: true }, 200, { "set-cookie": await startSession(db, id, request) });
    }

    if (path === "/signup" && method === "POST") {
      const b = await readBody(request);
      const email = cleanEmail(b.email);
      const name = String(b.name || "").trim().slice(0, 80);
      if (!name) return err(400, "Enter your name.");
      if (!validEmail(email)) return err(400, "Enter a valid email.");
      if (String(b.password || "").length < 8) return err(400, "Use a password of at least 8 characters.");
      if (!b.consent) return err(400, "Please tick the consent box.");
      const taken = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
      if (taken) return err(409, "There's already an account with that email. Log in instead.");
      const form = { ...(b.form || {}), email, name, consent_at: new Date().toISOString() };
      const { hash, salt } = await hashPassword(String(b.password));
      const id = randomId();
      await db.prepare("INSERT INTO users (id, email, name, role, pw_hash, pw_salt, status, form, created_at) VALUES (?, ?, ?, 'client', ?, ?, 'pending', ?, ?)")
        .bind(id, email, name, hash, salt, JSON.stringify(form).slice(0, 100000), new Date().toISOString()).run();
      return json({ ok: true }, 200, { "set-cookie": await startSession(db, id, request) });
    }

    if (path === "/login" && method === "POST") {
      const b = await readBody(request);
      const u = await db.prepare("SELECT * FROM users WHERE email = ?").bind(cleanEmail(b.email)).first();
      const { hash } = await hashPassword(String(b.password || ""), u ? u.pw_salt : undefined);
      if (!u || !safeEqual(hash, u.pw_hash)) return err(401, "That email and password don't match.");
      return json({ ok: true }, 200, { "set-cookie": await startSession(db, u.id, request) });
    }

    if (path === "/logout" && method === "POST") {
      const m = (request.headers.get("cookie") || "").match(new RegExp(`(?:^|; )${COOKIE}=([a-f0-9]+)`));
      if (m) await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(m[1])).run();
      return json({ ok: true }, 200, { "set-cookie": clearCookie });
    }

    // ---------- signed in ----------
    const me = await currentUser(db, request);
    if (!me) return err(401, "Not logged in");

    if (path === "/state" && method === "GET") {
      const settings = await getSettings(db);
      if (me.role === "client") {
        const n = await db.prepare("SELECT text, at FROM notes WHERE client_id = ?").bind(me.id).first();
        return json({ me: publicUser(me), logs: await logsFor(db, me.id), notes: n ? { [me.id]: n } : {}, settings, today: londonToday() });
      }
      const { results: users } = await db.prepare("SELECT * FROM users WHERE role = 'client' ORDER BY created_at").all();
      const { results: logRows } = await db.prepare("SELECT user_id, date, data FROM logs").all();
      const { results: noteRows } = await db.prepare("SELECT client_id, text, at FROM notes").all();
      const logs = {}, notes = {};
      for (const r of logRows) (logs[r.user_id] = logs[r.user_id] || {})[r.date] = JSON.parse(r.data);
      for (const r of noteRows) notes[r.client_id] = { text: r.text, at: r.at };
      return json({ me: publicUser(me), clients: users.map(publicUser), logs, notes, settings, today: londonToday() });
    }

    if (path === "/password" && method === "POST") {
      const b = await readBody(request);
      const { hash: cur } = await hashPassword(String(b.current || ""), me.pw_salt);
      if (!safeEqual(cur, me.pw_hash)) return err(403, "Your current password isn't right.");
      if (String(b.password || "").length < 8) return err(400, "Use a password of at least 8 characters.");
      const { hash, salt } = await hashPassword(String(b.password));
      await db.prepare("UPDATE users SET pw_hash = ?, pw_salt = ? WHERE id = ?").bind(hash, salt, me.id).run();
      return json({ ok: true });
    }

    // Clients save their own day logs. Notes the client can see are in /state.
    const logM = path.match(/^\/logs\/(\d{4}-\d{2}-\d{2})$/);
    if (logM && method === "PUT") {
      if (me.role !== "client") return err(403, "Only clients save day logs.");
      if (me.status !== "active") return err(403, "Your targets haven't been set yet.");
      const b = await readBody(request);
      if (!b || typeof b.data !== "object" || Array.isArray(b.data)) return err(400, "Bad log");
      const data = JSON.stringify(b.data);
      if (data.length > 60000) return err(413, "That day's log is too large.");
      await db.prepare("INSERT INTO logs (user_id, date, data, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, date) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at")
        .bind(me.id, logM[1], data, new Date().toISOString()).run();
      return json({ ok: true });
    }

    if (path === "/note" && method === "GET") {
      const n = await db.prepare("SELECT text, at FROM notes WHERE client_id = ?").bind(me.id).first();
      return json({ note: n || null });
    }

    // ---------- coach only ----------
    if (me.role !== "coach") return err(403, "Coach only");

    const cM = path.match(/^\/clients\/([a-f0-9]{32})(?:\/(targets|note|password))?$/);
    if (cM) {
      const client = await db.prepare("SELECT * FROM users WHERE id = ? AND role = 'client'").bind(cM[1]).first();
      if (!client) return err(404, "Client not found");
      const b = method === "GET" ? {} : await readBody(request);

      if (cM[2] === "targets" && method === "POST") {
        const t = { steps: Math.round(Number(b.steps)), protein: Math.round(Number(b.protein)), water: Math.round(Number(b.water) * 10) / 10 };
        if (!(t.steps > 0 && t.protein > 0 && t.water > 0)) return err(400, "Fill in all three targets.");
        if (client.status === "pending") {
          await db.prepare("UPDATE users SET targets = ?, status = 'active', start_date = ?, assigned_at = ? WHERE id = ?")
            .bind(JSON.stringify(t), londonToday(), new Date().toISOString(), client.id).run();
        } else {
          await db.prepare("UPDATE users SET targets = ? WHERE id = ?").bind(JSON.stringify(t), client.id).run();
        }
        return json({ ok: true });
      }
      if (cM[2] === "note" && method === "PUT") {
        const text = String(b.text || "").slice(0, 4000);
        await db.prepare("INSERT INTO notes (client_id, text, at) VALUES (?, ?, ?) ON CONFLICT(client_id) DO UPDATE SET text = excluded.text, at = excluded.at")
          .bind(client.id, text, Date.now()).run();
        return json({ ok: true });
      }
      if (cM[2] === "password" && method === "POST") {
        if (String(b.password || "").length < 8) return err(400, "Use a password of at least 8 characters.");
        const { hash, salt } = await hashPassword(String(b.password));
        await db.batch([
          db.prepare("UPDATE users SET pw_hash = ?, pw_salt = ? WHERE id = ?").bind(hash, salt, client.id),
          db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(client.id)
        ]);
        return json({ ok: true });
      }
      if (!cM[2] && method === "DELETE") {
        await db.batch([
          db.prepare("DELETE FROM logs WHERE user_id = ?").bind(client.id),
          db.prepare("DELETE FROM notes WHERE client_id = ?").bind(client.id),
          db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(client.id),
          db.prepare("DELETE FROM users WHERE id = ?").bind(client.id)
        ]);
        return json({ ok: true });
      }
    }

    if (path === "/settings" && method === "PUT") {
      const b = await readBody(request);
      if (b.weeks === null) await db.prepare("DELETE FROM settings WHERE key = 'weeks'").run();
      else {
        if (!Array.isArray(b.weeks) || b.weeks.length !== 4) return err(400, "Bad settings");
        await db.prepare("INSERT INTO settings (key, value) VALUES ('weeks', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
          .bind(JSON.stringify(b.weeks).slice(0, 20000)).run();
      }
      return json({ ok: true });
    }

    return err(404, "Not found");
  } catch (e) {
    if (e instanceof SyntaxError || e.message === "too large") return err(400, "Bad request");
    console.error(e);
    return err(500, "Something went wrong. Try again.");
  }
}
