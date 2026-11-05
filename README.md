# Project Reset

Web app for GrowLikeVines' Project Reset, the 28 day programme. Clients log in, read the programme content and work through their day in three parts. The coach gets an overview of every client's progress.

## Current state

`index.html` is a clickable prototype. It's a single file with no build step. Open it in a browser, or serve the folder with any static host.

### How a client's day works

The day runs as a loop. The Evening sets up tomorrow, the Morning opens it, the client runs the Day, and every day ends with a score.

- **Evening (reduce arousal):** 3 steps in order. Review your day: tick off the to-do list (carrying unfinished tasks into tomorrow), log steps, water and protein against targets, add the steps screenshot and do a 1 to 10 self-assessment. Non-negotiables and wind down: tick each non-negotiable kept today, pick a wind down tool, log PM state. Set up tomorrow: wake time, plan of action, tomorrow's to-do list, one thing to bank, brain dump. New clients start here.
- **Morning (stimulation and arousal):** 3 steps in order. Wake and action: AM state, the non-negotiables applied (these tick the four brain targets) and morning steps. Bring it down: Wim Hof or breathwork. Meal 1 and set the day: Meal 1 (non-negotiable), training yes or no, energy. Shows last night's plan, the banked insight and the ready to-do list. The Day stays locked until all 3 steps are done.
- **Day (keep energy stable):** last night's to-do list is loaded ready to tick off, and the client can add more. Meals have their own section: Meal 1 from the morning, then Meals 2 to 6, each with a description and tags (carbs or fats depending on training).
- **Logging:** every step, task and meal logs its time automatically. Tasks and meals ask one process-order follow-up question. Day tasks and meals also have a quick "what did you notice?" note, and everything is filed into a timeline.
- **One page:** Morning, Day and Evening sit on one page as blocks, in order. When a block is done it folds into a grey one-line summary (tap Edit to reopen it) and the next block opens. The Morning folds once its 3 steps are done, the Day folds when the client taps Finish my day, and the Evening folds into the day's score.
- **Points:** 1 point per completed step, task, meal and non-negotiable kept.

### Coach view

- **Client overview:** points, completion, morning and evening completion, process order rate, senses and steps for each client
- **Breakdowns:** completion rate for each step, and the make-up of Day lists
- **Client detail:** a log for each day, trend charts and a note to the client
- **Number setter:** steps, water and protein targets, plus the theme and sticky note for each week

### Demo logins

"Start as a new client" begins on Day 1 with nothing logged, starting from tonight's Evening, with a "Jump to tomorrow" button to step through the loop. "Sample client (Day 9)" opens a client with history, "Enter as coach" opens the dashboard, and "Reset all demo data" clears everything.

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
