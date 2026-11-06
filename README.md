# Project Reset

The web app for GrowLikeVines' Project Reset, Ellis Vine's 28 day coaching programme. Clients sign up with an onboarding form, Ellis assigns their daily steps, protein and water targets, and they work through each day in three parts: the Morning shift, the Day and the Evening shift. Ellis gets an overview of every client.

## What's in the repo

| Path | What it is |
| --- | --- |
| `public/index.html` | The live app. Everything the browser loads is in this one file. |
| `public/_headers` | Security headers for Cloudflare Pages. |
| `functions/api/[[path]].js` | The server, as Cloudflare Pages Functions: logins, sign-ups, saving logs and the coach tools. |
| `prototype/index.html` | The old clickable prototype with sample clients, kept for reference. It isn't deployed. |

All data lives in a Cloudflare D1 database. The tables are created automatically the first time the app runs.

## How it works

1. **Sign-up.** A new client opens the app, chooses "Start your onboarding form", answers the questions (about you, goal, lifestyle, training, food, health), creates a password and ticks the consent box. They then see a waiting screen.
2. **Targets.** Ellis logs in and sees them under **New sign-ups**. He reviews their answers, adjusts the suggested steps, protein and water, and presses **Assign targets & start Day 0**.
3. **Day 0.** That evening is the client's setup night: they see their targets and plan Day 1 (meals, morning tasks, training, intentions, wake up time).
4. **Days 1 to 28.** Each day runs Morning shift, Day, Evening shift. Everything they log is saved to the database as they go, so they can switch between phone and laptop.

Coach tools: client overview and detail pages, notes to a client (shown at the top of their day), the Number setter, and per-client **Onboarding, targets & account**, where Ellis can edit targets, set a new password for a client who's forgotten theirs, or remove a client.

## Deploying on Cloudflare (one-time setup)

1. **Create the database.** In the Cloudflare dashboard go to **Storage & databases → D1 → Create database**. Name it `growlikevines`.
2. **Create the Pages project.** Go to **Workers & Pages → Create → Pages → Connect to Git** and pick `repshealth/growlikevines`. Use these build settings:
   - Framework preset: **None**
   - Build command: leave empty
   - Build output directory: `public`
3. **Bind the database.** In the new project go to **Settings → Bindings → Add → D1 database**. Variable name `DB`, database `growlikevines`. Add it for Production (and Preview if you use preview links).
4. **Add the setup key.** In **Settings → Variables and Secrets**, add a **Secret** called `SETUP_KEY` with a long random value. You only need it once, to create Ellis's account.
5. **Redeploy.** Go to **Deployments** and retry the latest deployment so the binding and secret take effect.
6. **Create Ellis's coach account.** Open the site. While no coach account exists, it shows a first-time setup screen: enter the setup key, Ellis's name, email and a password. After that the setup screen never shows again.
7. **Custom domain (optional).** **Custom domains → Set up a domain**, then follow the DNS steps.

After this, every push to `main` deploys automatically.

## Running it locally

```
npm i -g wrangler
echo "SETUP_KEY=anything" > .dev.vars
wrangler pages dev public --d1 DB
```

Then open http://localhost:8788. Local data is kept in `.wrangler/` and is never committed.

## Before inviting real clients

- **Privacy policy.** The form collects health information (injuries and medical conditions), which is special category data under UK GDPR. Ellis needs a privacy policy that says what's collected, why, and how long it's kept, and it should be linked from the consent box.
- **Password resets.** There's no automatic "forgot password" email yet; Ellis sets a new password from the client's account page. Self-service reset needs an email service (for example Resend) and can be added later.
- **Payment.** Clients pay outside the app for now.
