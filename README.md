# Project Reset

The web app for GrowLikeVines' Project Reset, Ellis Vine's 28 day coaching programme. Clients sign up with an onboarding form, Ellis assigns their daily steps, protein and water targets, and they work through each day in three parts: the Morning shift, the Day and the Evening shift. Ellis gets an overview of every client.

## What's in the repo

| Path | What it is |
| --- | --- |
| `public/index.html` | The live app. Everything the browser loads is in this one file. |
| `public/_headers` | Security headers. |
| `src/worker.js` | The Cloudflare Worker: serves `public/` and sends `/api/*` to the server code. |
| `src/api.js` | The server: logins, sign-ups, saving logs and the coach tools. |
| `wrangler.jsonc` | Worker settings, including the D1 database binding. |
| `prototype/index.html` | The old clickable prototype with sample clients, kept for reference. It isn't deployed. |

All data lives in a Cloudflare D1 database. The tables are created automatically the first time the app runs.

## How it works

1. **Sign-up.** A new client opens the app, chooses "Start your onboarding form", answers the questions (about you, goal, lifestyle, training, food, health), creates a password and ticks the consent box. They then see a waiting screen.
2. **Targets.** Ellis logs in and sees them under **New sign-ups**. He reviews their answers, adjusts the suggested steps, protein and water, and presses **Assign targets & start Day 0**.
3. **Day 0.** That evening is the client's setup night: they see their targets and plan Day 1 (meals, morning tasks, training, intentions, wake up time).
4. **Days 1 to 28.** Each day runs Morning shift, Day, Evening shift. Everything they log is saved to the database as they go, so they can switch between phone and laptop.

Coach tools: client overview and detail pages, notes to a client (shown at the top of their day), the Number setter, and per-client **Onboarding, targets & account**, where Ellis can edit targets, set a new password for a client who's forgotten theirs, or remove a client.

## Deploying on Cloudflare (one-time setup)

The app is a Cloudflare Worker with static assets, deployed from GitHub with Workers Builds (the same way as the REPS dashboard).

1. **Create the database.** **Storage & databases → D1 SQL Database → Create Database**, name it `growlikevines`, and copy its **Database ID**.
2. **Put the ID in `wrangler.jsonc`** (already done: `4a397150-56d5-4d6c-ae20-cefb863e3516`).
3. **Create the Worker.** **Workers & Pages → Create application → Import a repository**, pick `repshealth/growlikevines`. Project name `growlikevines`, build command empty, deploy command `npx wrangler deploy` (the default). Deploy.
4. **Add the setup key.** In the Worker, **Settings → Variables and Secrets → Add**, type **Secret**, name `SETUP_KEY`, a long random value. Secrets apply straight away.
5. **Create Ellis's coach account.** Open the Worker's address. A first-time setup screen asks for the setup key and Ellis's details. It never shows again after that.
6. **Custom domain.** **Settings → Domains & Routes → Add → Custom domain**.

After this, every push to `main` deploys automatically.

## Running it locally

```
npm i -g wrangler
echo "SETUP_KEY=anything" > .dev.vars
wrangler dev
```

Then open http://localhost:8787. Local data is kept in `.wrangler/` and is never committed.

## Before inviting real clients

- **Privacy policy.** The form collects health information (injuries and medical conditions), which is special category data under UK GDPR. Ellis needs a privacy policy that says what's collected, why, and how long it's kept, and it should be linked from the consent box.
- **Password resets.** There's no automatic "forgot password" email yet; Ellis sets a new password from the client's account page. Self-service reset needs an email service (for example Resend) and can be added later.
- **Payment.** Clients pay outside the app for now.
