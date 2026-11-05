# Project Reset

Web app for GrowLikeVines' Project Reset, the 28 day programme. Clients log in, read the programme content and work through their day in three parts. The coach gets an overview of every client's progress.

## Current state

`index.html` is a clickable prototype. It's a single file with no build step. Open it in a browser, or serve the folder with any static host.

### How a client's day works

The day runs as a loop. The Evening plans tomorrow, the Morning opens it, the client ticks off the Day, and every day ends with a score.

- **Day 0 (setup night):** the evening a new client signs up. Your targets: shows the client's daily steps, protein and water targets (display only for now; in the live app Ellis sets these per client from the onboarding form). Plan tomorrow's morning and training: alarm, arousal activity, how to bring it down, training yes or no with time and workout. Plan Day 1's meals with the approved foods picker, plus an optional own to-do list. Day 1 starts the next morning.
- **Evening (reduce arousal):** 3 steps in order. Review your day: final steps, protein and water against targets, plus a 1 to 10 self-assessment. Non-negotiables and wind down. Set up tomorrow: alarm, arousal activity, bring-it-down activity, training (time and workout), meals, optional to-do list, plan of action, banked insight, brain dump.
- **Morning (stimulation and arousal):** 5 steps in order. Wake up: the client enters the time they woke up, shown next to their alarm as on time or late. Arousal activity: last night's pick, tick it done or change it (ticks the brain targets). Bring it down: last night's pick, done or change. Meal 1: non-negotiable, the planned meal shown as a card with Change, plus did you have water with it. It shows as already ticked in the Day. Morning check-in: steps, protein and water so far, with what's left to go. Then the Day opens.
- **Day (keep energy stable):** the planned meals, each followed by a walk block. After Meal 2 and again after Meal 3 a number check-in asks for the latest steps, protein and water, and the next meal stays locked until it's done. After the last meal the client is sent to the Evening for their final numbers. Ticking a meal asks about water (yes adds 500ml), then nudges them to walk. On training days the session sits between the pre-workout and post-workout meals: Start workout opens the workout (PDF from the library), Finish workout ticks it off. Pre and post-workout meals nudge for a carb source when planned.
- **Target gauges:** a floating bar at the bottom of the screen shows steps, protein and water as rings filling towards target, turning lime with a tick when hit. Tap it to update the numbers at any time.
- **One page:** Morning, Day and Evening are blocks on one page. The current one is pale green, finished ones fold into grey ticked boxes, upcoming ones are faded and locked.
- **Points:** 1 point per step, meal, walk block, training session and non-negotiable kept.

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
- Workout PDFs for each library entry (the list is in, the PDFs still need attaching)
- Protein targets

## Next steps

- Onboarding form (height, weight and so on) after purchase, and per-client targets that Ellis sets from it

- Real authentication and a shared database (for example React with Supabase)
- Replace the text wordmark with the GrowLikeVines logo
