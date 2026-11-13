// Project Reset emails, sent through Resend (https://resend.com).
// Secrets (Cloudflare: Worker > Settings > Variables and Secrets):
//   RESEND_API_KEY  the Resend API key
//   EMAIL_FROM      who emails come from, e.g. "Project Reset <hello@yourdomain.com>" (domain verified in Resend)
//   STRIPE_PAYMENT_LINK  the Project Reset Payment Link id (plink_...): only its checkouts send emails
//   NOTIFY_EMAIL    optional: where Ellis's alerts go. If it's not set, they go to every coach account's email.
// If RESEND_API_KEY or EMAIL_FROM isn't set, emails are skipped quietly and everything else still works.

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const first = name => esc(String(name || "").trim().split(/\s+/)[0] || "there");

export const BILLING_URL = "https://billing.stripe.com/p/login/14keXXarc4nV49i6oo";

// One branded layout for every email: logo, a heading, the body, an optional button, a sign-off
function layout(origin, { heading, body, button, foot }) {
  const btn = button ? `<tr><td style="padding:8px 0 4px"><a href="${esc(button.href)}" style="display:inline-block;background:#a9e80c;color:#000;font-weight:800;font-size:16px;text-decoration:none;padding:15px 28px;border-radius:999px">${esc(button.label)}</a></td></tr>` : "";
  return `<!doctype html><html><body style="margin:0;background:#f3f7ec;font-family:Montserrat,Helvetica,Arial,sans-serif;color:#000">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f7ec;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:22px;padding:32px 30px">
<tr><td><img src="${esc(origin)}/home/email-logo.png" width="120" alt="Project Reset" style="display:block;margin-bottom:22px"></td></tr>
<tr><td style="font-size:30px;line-height:1.05;font-weight:900;font-style:italic;text-transform:uppercase;padding-bottom:16px">${heading}</td></tr>
<tr><td style="font-size:16px;line-height:1.6;color:#2b2f29">${body}</td></tr>
${btn}
<tr><td style="font-size:16px;line-height:1.6;padding-top:20px">Change what's below the surface.<br><b>Ellis</b></td></tr>
</table>
${foot ? `<table role="presentation" width="100%" style="max-width:560px"><tr><td style="font-size:12px;line-height:1.5;color:#6b7266;padding:16px 8px;text-align:center">${foot}</td></tr></table>` : ""}
</td></tr></table></body></html>`;
}
const text = html => html.replace(/<br\s*\/?>/g, "\n").replace(/<\/(p|tr|li)>/g, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\n{3,}/g, "\n\n").trim();

// ---------- the emails ----------
export function welcomeEmail(origin, { name, link }) {
  const html = layout(origin, {
    heading: "You're now part of the reset.",
    body: `<p style="margin:0 0 14px">Hi ${first(name)},</p>
<p style="margin:0 0 14px">Your 7 day free trial has started. Your first step is your onboarding form: Your basics, your stats and a day in your life.</p>
<p style="margin:0 0 14px">Once it's in, I'll go through your answers myself and set your daily targets for steps, protein and water. You'll get an email as soon as they're ready.</p>`,
    button: { href: link, label: "Fill in my onboarding form" },
    foot: `This link is just for you, so please don't share it.<br>Nothing has been charged yet. £75 is taken after your first 7 days. Cancel within 7 days and you won't be charged: <a href="${BILLING_URL}" style="color:#4f7300">manage your trial</a>.`
  });
  return { subject: "You're in. Here's your onboarding form", html, text: text(html) + `\n\nYour onboarding form: ${link}` };
}

export function targetsReadyEmail(origin, { name, targets }) {
  const t = targets || {};
  const html = layout(origin, {
    heading: "Your targets are set.",
    body: `<p style="margin:0 0 14px">Hi ${first(name)},</p>
<p style="margin:0 0 14px">I've been through your answers and set your daily targets:</p>
<p style="margin:0 0 14px;font-size:18px;line-height:1.7"><b>${esc(Number(t.steps || 0).toLocaleString("en-GB"))}</b> steps<br><b>${esc(t.protein)}g</b> protein<br><b>${esc(t.water)}L</b> water</p>
<p style="margin:0 0 14px">Log in, watch the 3 short videos, and that evening is your Day 0: Your set-up night, where you plan your first day. Day 1 starts the next morning.</p>`,
    button: { href: origin + "/app", label: "Log in to Project Reset" }
  });
  return { subject: "Your targets are set. Time to start", html, text: text(html) + `\n\nLog in: ${origin}/app` };
}

export function coachNewSignupEmail(origin, { name, email }) {
  const html = layout(origin, {
    heading: "New sign-up",
    body: `<p style="margin:0 0 14px"><b>${esc(name || "Someone")}</b> (${esc(email)}) has just started their 7 day free trial.</p>
<p style="margin:0 0 14px">Their onboarding link has been emailed to them. You'll get another email when they've sent their form.</p>`
  });
  return { subject: `New sign-up: ${name || email}`, html, text: text(html) };
}

export function coachOnboardedEmail(origin, { name, email }) {
  const html = layout(origin, {
    heading: "Onboarding form in",
    body: `<p style="margin:0 0 14px"><b>${esc(name)}</b> (${esc(email)}) has sent their onboarding form.</p>
<p style="margin:0 0 14px">Set their steps, protein and water targets so they can start. They'll get an email as soon as you do.</p>`,
    button: { href: origin + "/app", label: "Set their targets" }
  });
  return { subject: `${name} has sent their onboarding form`, html, text: text(html) };
}

// ---------- sending ----------
// Clean up whatever got pasted: spaces, line breaks, quotes, a stray "Bearer "
const resendKey = env => String(env.RESEND_API_KEY || "").replace(/^\s*bearer\s+/i, "").replace(/[\s"'\u200b\u00a0]/g, "");
// A safe hint of the key the app is using (start, end and length), to compare with Resend's dashboard
const keyHint = env => { const k = resendKey(env); return k ? `${k.slice(0, 6)}...${k.slice(-3)} (${k.length} characters)` : "none"; };
export async function sendEmail(env, to, msg) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM || !to || (Array.isArray(to) && !to.length)) return { skipped: !env.RESEND_API_KEY ? "no RESEND_API_KEY" : !env.EMAIL_FROM ? "no EMAIL_FROM" : "no recipient" };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "authorization": `Bearer ${resendKey(env)}`, "content-type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: Array.isArray(to) ? to : [to], subject: msg.subject, html: msg.html, text: msg.text })
    });
    if (!r.ok) { const body = await r.text(); console.log("Resend error", r.status, body); return { ok: false, status: r.status, error: body.slice(0, 300), key: keyHint(env) }; }
    return { ok: true };
  } catch (e) { console.log("Resend failed", e && e.message); return { ok: false, error: String(e && e.message) }; }
}

// Where Ellis's alerts go
export async function coachEmails(env, db) {
  if (env.NOTIFY_EMAIL) return String(env.NOTIFY_EMAIL).split(",").map(s => s.trim()).filter(Boolean);
  const rows = await db.prepare("SELECT email FROM users WHERE role = 'coach'").all();
  return (rows.results || []).map(r => r.email);
}

// ---------- Stripe webhook signature (Stripe-Signature: t=...,v1=...) ----------
export async function verifyStripe(payload, header, secret) {
  if (!header || !secret) return false;
  const parts = header.split(",").map(p => p.split("="));
  const t = (parts.find(p => p[0] === "t") || [])[1];
  const sigs = parts.filter(p => p[0] === "v1").map(p => p[1]);
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - Number(t)) > 600) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = [...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${payload}`)))].map(b => b.toString(16).padStart(2, "0")).join("");
  return sigs.some(s => s.length === mac.length && [...s].reduce((r, c, i) => r | (c.charCodeAt(0) ^ mac.charCodeAt(i)), 0) === 0);
}
