# AIR Workshop

## Stack
- Next.js with the App Router, TypeScript, plain CSS (no CSS frameworks).
- Supabase for sign-in and the database.
- Deployed on Vercel. Every pushed branch gets a preview link; merging to main deploys the live site at https://ai-workshop-two-omega.vercel.app/

## Commands
- Read package.json first and use the scripts listed there. If they are the Next.js defaults, they are:
- `npm run dev` starts the site locally
- `npm run build` checks that the site builds; run it before pushing
- `npm run lint` checks code style, if a lint script exists

## Never
- Add a dependency, library, service, or account without asking first.
- Edit .env or any environment variable.
- Change auth configuration without saying what is changing and why.
- Create new top-level folders.
- Put a password, API key, or connection string in any file, prompt, commit, or message.
- Merge a pull request. Logan merges.
- Edit roadmap.md, project-state.md, or CLAUDE.md, unless the prompt says it is a doc prompt.
- Use real personal data. Fake names and fake content only.

## Conventions
- Each session works on its own branch, pushes it, opens a draft pull request, and stops.
- Every pull request description explains in plain language what changed and why, for a reader with no coding background.
- Work only toward the done-criteria of the ACTIVE slice. Note anything else as a backlog suggestion in the pull request; do not build it.
- Keys and passwords live only in Vercel > ai-workshop > Settings > Environment Variables. Code reads them from environment variables by name.
- A slice is finished only when its done-criteria pass on the live site, not when the code is pushed.

## Current focus
See roadmap.md. Work only on the slice marked ACTIVE.
