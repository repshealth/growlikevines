# Project Reset

Web app for GrowLikeVines' Project Reset, the 28 day programme. Clients log in, read the programme content and tick off their daily tasks. The coach gets an overview of every client's progress.

## Current state

`index.html` is a clickable prototype. It's a single file with no build step. Open it in a browser, or serve the folder with any static host.

- **Client view:** Today (the daily checklist with targets, week theme and sticky note, with non negotiables on each task), Programme (the Notion content plus the Recharge, Eat, Steps and Evolve pillars) and Progress (the 28 day map, trend charts and non negotiable rates)
- **Training or rest day:** the first question each day. Training days add a pre workout meal (protein + carbs), the training session and a post workout meal, with the workout non negotiables on those rows. Rest days switch every meal to fats, no carbs, and Training becomes a Movement row (mobility, breath drill or full rest).
- **Non negotiables:** built into the task they belong to as small tick chips, for example No added sugar on each meal, Salt and Caffeine on Water, and warm up on Training. Others tick themselves from what is logged, such as Breathwork in Resets covering Breathe. Training day items only show when a gym or home workout is logged.
- **Coach view:** a client overview table with status and non negotiable adherence, a habits breakdown for tasks or non negotiables, a detail page for each client with notes to that client, and weekly settings for themes and targets
- **Data:** sample clients only. Edits save to the browser's localStorage, so nothing is shared between devices or users yet.

On the login screen, use "Enter as client" or "Enter as coach".

## Next steps

- Real authentication and a shared database (for example React with Supabase)
- Import the remaining daily template fields from the Notion page
- Fill in the remaining Toolkit pages (Get started, Mindset, My space)
- Replace the text wordmark with the GrowLikeVines logo
