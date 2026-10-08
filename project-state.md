# Project state
Last updated: 2026-10-08

## Works
- A Next.js site (App Router, TypeScript, plain CSS) is live on Vercel at https://ai-workshop-two-omega.vercel.app/
- A Supabase project exists at https://ofvzqpxzwalrfjxykfyx.supabase.co and is linked to the repo.

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
