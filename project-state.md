# Project state
Last updated: 2026-10-13

## Works
- A Next.js site (App Router, TypeScript, plain CSS) is live on Vercel at https://ai-workshop-two-omega.vercel.app/
- A Supabase project exists at https://ofvzqpxzwalrfjxykfyx.supabase.co and is linked to the repo.
- On the live site, a person can create an account with an email and a password of at least 8 characters. Right after, the page says "Signed in as" followed by their email.
- A person can sign out, and then log back in with the same email and password. A wrong password shows an error message and they stay signed out.
- A person who closes the tab while signed in and comes back to the site is still signed in.
- The /account page shows the Log in form when nobody is signed in.
- A signed-in person can type a study task, pick one of six skills (Listening, Speaking, Reading, Writing, Vocabulary, Grammar), and click Add. The task appears right away with its skill name next to it.
- A person's tasks are saved. After signing out and back in, they see the same tasks with the same skills.
- Each person sees only their own tasks. A second account sees none of the first account's tasks.
- A person can click Mark done on a task. It shows as done and stays done after the page is reloaded.

## Broken or flaky
- Nothing reported.
- The site does not use Supabase yet. This is expected, not a bug: Slice 1 is where that starts.

## Environment notes
- Repo: loganlet/AI-Workshop, default branch main. Vercel project: ai-workshop.
- Every pushed branch gets a Vercel preview link on its pull request. Merging to main deploys the live site.
- Keys and passwords go only in Vercel > ai-workshop > Settings > Environment Variables. Never in chat, prompts, or repo files.
- Not yet checked: whether the Supabase URL and public key are already set as environment variables in Vercel.
- Decision for Slice 1: turn off "Confirm email" in Supabase so sign-up works without an inbox step. Supabase's built-in email sender has a low hourly limit, so it is unreliable for a demo. Email confirmation is in the Backlog.

## Next session
- Merge the "Project docs" pull request so roadmap.md, project-state.md, and CLAUDE.md are on main.
- Start Slice 1 (Sign up and log in) in a new Claude Code session.
- Before Slice 1 is tested on the live site: confirm the Supabase environment variables exist in Vercel, and turn off "Confirm email" in Supabase.
