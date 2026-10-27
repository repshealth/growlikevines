# Project Reset

Web app for GrowLikeVines' Project Reset, the 28 day programme. Clients log in, read the programme content and work through their day in three parts. The coach gets an overview of every client's progress.

## Current state

`index.html` is a clickable prototype. It's a single file with no build step. Open it in a browser, or serve the folder with any static host.

### How a client's day works

- **Evening (reduce arousal):** 3 steps done in order: close the day (steps, water and protein against targets, plus a steps screenshot), bring it down (wind down tool, PM state) and set up tomorrow (wake time, plan of action, brain dump). New clients start here.
- **Morning (stimulation and arousal):** 3 steps done in order: rise and breathe, light and move, open the day (energy and training check-in). The Day stays locked until all 3 are done.
- **Day (keep energy stable):** the client builds their own list. They write their own tasks and add meals, steps, regulation tools and training from the options. A direction and suggestions come from their morning answers.
- **Logging:** every step and task logs its time automatically. Every Day task asks one follow-up question to check it was done in the right process order.
- **Senses:** sight, sound, smell, taste and touch fill in automatically from what was done.
- **Points:** 1 point per completed step or task.

### Coach view

- **Client overview:** points, completion, morning and evening completion, process order rate, senses and steps for each client
- **Breakdowns:** completion rate for each step, and the make-up of Day lists
- **Client detail:** a log for each day, trend charts and a note to the client
- **Number setter:** steps, water and protein targets, plus the theme and sticky note for each week

### Data

Sample clients only. Edits save to the browser's localStorage, so nothing is shared between devices or users yet.

## Placeholders to replace with Ellis's content

- The wording of the 3 Morning and 3 Evening steps and the questions inside them
- The follow-up question for each type of task
- Which options evoke which senses
- Example meal plans and training guidance
- Protein targets

## Next steps

- Real authentication and a shared database (for example React with Supabase)
- Replace the text wordmark with the GrowLikeVines logo
