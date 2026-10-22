# Project Reset

Web app for GrowLikeVines' Project Reset, the 28 day programme. Clients log in, read the programme content and tick off their daily tasks. The coach gets an overview of every client's progress.

## Current state

`index.html` is a clickable prototype. It's a single file with no build step. Open it in a browser, or serve the folder with any static host.

- **Client view:** Today (the daily checklist with targets, week theme and sticky note), Programme (the Notion content) and Progress (the 28 day map and trend charts)
- **Coach view:** a client overview table with status, a habits breakdown, a detail page for each client with notes to that client, and weekly settings for themes and targets
- **Data:** sample clients only. Edits save to the browser's localStorage, so nothing is shared between devices or users yet.

On the login screen, use "Enter as client" or "Enter as coach".

## Next steps

- Real authentication and a shared database (for example React with Supabase)
- Import the remaining daily template fields from the Notion page
- Fill in the Toolkit pages (Eat, Steps, Evolve, Recharge, Mindset, My space)
- Replace the text wordmark with the GrowLikeVines logo
