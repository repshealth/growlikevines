# Project Reset

Web app for GrowLikeVines' Project Reset, the 28 day programme. Clients log in, read the programme content and work through their day in three parts. The coach gets an overview of every client's progress.

## Current state

`index.html` is a clickable prototype. It's a single file with no build step. Open it in a browser, or serve the folder with any static host.

### How a client's day works

- **Day 0 (setup night):** a new client signs up and fills in the form, and that evening is Day 0. Three steps: where you're starting (baseline), plan tomorrow's meals, and set up Day 1 (wake time, plan of action, first to-do list). It ends on a "You're set for Day 1" card. Day 1 starts the next morning. Meal 1's planned foods are pre-selected in the Morning and Meals 2 to 5 are already in the Day with their foods, so the client just ticks them off.

The day runs as a loop. The Evening sets up tomorrow, the Morning opens it, the client runs the Day, and every day ends with a score.

- **Evening (reduce arousal):** 3 steps in order. Review your day: log steps, water and protein against targets, add the steps screenshot and do a 1 to 10 self-assessment. Non-negotiables and wind down: tick each non-negotiable kept today, pick a wind down tool, log PM state. Set up tomorrow: wake time, plan of action, tomorrow's to-do list, one thing to bank, brain dump. Each Evening also asks if tomorrow is a training day and at what time, and plans tomorrow's Meals 1 to 5 with the approved foods picker. The training time places the session between a pre-workout and a post-workout meal (adjustable).
- **Morning (stimulation and arousal):** 3 steps in order. Wake and action: AM state, the non-negotiables applied (these tick the four brain targets) and morning steps. Bring it down: Wim Hof or breathwork. Meal 1 and set the day: Meal 1 (non-negotiable) and energy. Shows last night's plan, the banked insight and the ready to-do list. The Day stays locked until all 3 steps are done.
- **Day (keep energy stable):** kept simple. The Day is a list of non-negotiables: each meal (Meal 1 from the morning, then the meals planned last night, plus any added), each followed by a walk block. Tapping a meal opens the approved foods picker (Protein, Fruit, Veg, Fat, Carbs). Carbs are only available from Meal 2, and up to 5 meals can be logged. Meal 1 uses the same picker in the Morning. Ticking a meal asks "Did you have water with it?". On training days the session appears as a tickable row between the pre-workout and post-workout meals. A walk block unlocks once its meal is ticked. Last night's plan and to-do list show as a read-only plan for the day.
- **Logging:** every step, meal and walk block logs its time automatically, and everything is filed into a timeline.
- **One page:** Morning, Day and Evening sit on one page as blocks, in order. The block they're on is open in pale green, finished blocks fold into a large grey box with a big tick (tap Edit to reopen), and blocks still to come are faded white and locked. The Morning folds once its 3 steps are done, the Day folds when the client taps Finish my day, and the Evening folds into the day's score.
- **Points:** 1 point per completed step, meal, walk block and non-negotiable kept.

### Coach view

- **Client overview:** points, completion, morning and evening completion, process order rate, senses and steps for each client
- **Breakdowns:** completion rate for each step, and the make-up of Day lists
- **Client detail:** a log for each day, trend charts and a note to the client
- **Number setter:** steps, water and protein targets, plus the theme and sticky note for each week

### Demo logins

"Start as a new client" begins on Day 0, the setup night, with a "Jump to tomorrow" button to step through the loop. "Sample client (Day 9)" opens a client with history, "Enter as coach" opens the dashboard, and "Reset all demo data" clears everything.

### Data

Sample clients only. Edits save to the browser's localStorage, so nothing is shared between devices or users yet.

## Placeholders to replace with Ellis's content

- The wording of the 3 Morning and 3 Evening steps and the questions inside them
- The follow-up question for each type of task
- Which options evoke which senses
- Example meal plans and training guidance (the approved foods list is in, from the meal plans)
- Protein targets

## Next steps

- Real authentication and a shared database (for example React with Supabase)
- Replace the text wordmark with the GrowLikeVines logo
