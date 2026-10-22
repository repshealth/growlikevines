# Project Reset

Web app for GrowLikeVines' Project Reset, the 28 day programme. Clients log in, read the programme content and tick off their daily tasks. The coach gets an overview of every client's progress.

## Current state

`index.html` is a clickable prototype. It's a single file with no build step. Open it in a browser, or serve the folder with any static host.

- **Client view:** Today (the daily checklist with targets, week theme, sticky note and a non negotiables check-in), Programme (the Notion content plus the Recharge, Eat, Steps and Evolve pillars) and Progress (the 28 day map, trend charts and non negotiable rates)
- **Non negotiables:** about half tick themselves from the daily list (to-do list, steps, water, meal tags, resets). The rest are one tap each, with an "All kept" button per pillar. Training day items only show when a gym or home workout is logged.
- **Coach view:** a client overview table with status and non negotiable adherence, a habits breakdown for tasks or non negotiables, a detail page for each client with notes to that client, and weekly settings for themes and targets
- **Data:** sample clients only. Edits save to the browser's localStorage, so nothing is shared between devices or users yet.

On the login screen, use "Enter as client" or "Enter as coach".

## Next steps

- Real authentication and a shared database (for example React with Supabase)
- Import the remaining daily template fields from the Notion page
- Fill in the remaining Toolkit pages (Get started, Mindset, My space)
- Replace the text wordmark with the GrowLikeVines logo
