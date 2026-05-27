# WORKLOG.md

## Current project state

- Current amoCRM service page is created.
- UI polish has been applied to the amoCRM service page.
- SITE_SPEC.md and CODEX.md contain rules for scalable multi-service and SEO architecture.
- AMOCRM_INTEGRATION.md is created as the project-specific amoCRM integration guide.
- Security rules for amoCRM are documented: tokens and secrets must not be exposed in frontend code or committed to the repository.
- The site remains a static HTML/CSS/JS project without React, Next.js, Vite, Tailwind or heavy libraries.
- The amoCRM page can temporarily live at `index.html`, but architecturally it is prepared for future migration to `/services/amocrm/`.

## Current implementation notes

- The frontend form currently must not show fake success if no real endpoint is connected.
- Future form submissions must go only to `/api/lead`.
- amoCRM API calls must happen only in server-side code, for example Cloudflare Pages Functions.
- Real amoCRM tokens, refresh tokens, client secrets and Cloudflare credentials must be stored only as environment variables.

## Next logical stage

Implement `/api/lead` as a Cloudflare Pages Function without real secrets in the repository.

Expected scope:

- create `functions/api/lead.js`;
- validate POST JSON payload;
- read amoCRM configuration from environment variables;
- create an amoCRM lead via API;
- add a note with form data, UTM, referrer, landing page and timestamp;
- return honest success only after amoCRM accepts the lead;
- return clear errors when configuration or amoCRM request fails;
- keep frontend secrets-free.

## Stage after that

- Get real amoCRM environment variables from the account owner.
- Add them in Cloudflare Pages settings, not in git.
- Test a real website form submission.
- Verify that a real lead appears in the correct amoCRM pipeline and status.
- Verify that the note contains form data and UTM context.
- Decide whether contacts should remain manual for the first release or be created/searched automatically.

## Important recovery reminder

If work continues in a new session, read these files before making changes:

- `CODEX.md`
- `SITE_SPEC.md`
- `AMOCRM_INTEGRATION.md`
- `WORKLOG.md`

Then run `git status`, inspect the current repository state and continue from what is already implemented.
