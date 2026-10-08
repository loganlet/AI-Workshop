# Roadmap

## What this is
A study task list for people learning a language. Each task is tagged with one of six skills (Listening, Speaking, Reading, Writing, Vocabulary, Grammar), so the learner can see which skill they have been avoiding.

## What Done means
A stranger opens the live site, creates an account with an email and password, adds study tasks tagged with one of the six skills, and marks some done. They sign out, sign back in, and their tasks are still there. They see a count of completed tasks for each skill, with the lowest labeled "Most avoided." That is the finish line for the whole project. Everything else is backlog.

## Slices
1. Sign up and log in | done-criteria: (a) On the live site, a person clicks Sign up and enters an email never used on the site plus a password of at least 8 characters, then sees "Signed in as" followed by that email. (b) They click Sign out and see the Log in form; typing the site address followed by /account into the browser shows the Log in form, not their email. (c) Logging in with a wrong password shows an error message and they stay signed out; with the right password they see "Signed in as" and their email. (d) While signed in, they close the tab, reopen the live site, and still see "Signed in as" and their email. | status: ACTIVE
2. Tasks with skill tags that persist | done-criteria: (a) Signed in, a person types a task title, picks a skill from a list of exactly six, clicks Add, and without reloading sees the task with its skill name next to it. (b) They sign out, sign back in, and see the same tasks with the same skills. (c) A second account signed in from another browser sees none of the first account's tasks. (d) They click Mark done on a task; it shows as done and is still done after a page reload. | status: pending
3. Skill balance | done-criteria: (a) A signed-in person sees all six skills listed, each with the number of tasks they have marked done in that skill, with 0 shown for skills with none. (b) The skill with the lowest count is labeled "Most avoided"; if several tie for lowest, every tied skill gets the label. (c) They mark one task done in the "Most avoided" skill, and without reloading its count goes up by 1 and the label moves to whichever skill is now lowest. | status: pending

## Backlog
- Editing tasks
- Deleting tasks
- Due dates
- Password reset
- Email confirmation on sign-up
- Sign in with Google
- Custom skills beyond the six
- More than one language per person
- An "avoided in the last 7 days" time window
- Charts of skill balance over time
- Reminders and notifications
- Streaks
- Sharing tasks with other people
- A mobile app
