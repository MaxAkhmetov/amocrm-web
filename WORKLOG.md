# WORKLOG.md

## Current state

- Project is a static HTML/CSS/JS site for ilma.pro, without React, Next.js, Vite, Tailwind or other heavy frameworks.
- Current amoCRM page is a service page for the amoCRM direction, temporarily published through `index.html`.
- Architecture is prepared for future migration of this page to `/services/amocrm/`.
- SITE_SPEC.md and CODEX.md contain rules for scalable multi-service and SEO architecture.
- AMOCRM_INTEGRATION.md exists as the project-specific amoCRM integration guide.
- Security rules for amoCRM are documented: no tokens or secrets in frontend code or committed files.
- Frontend form sends lead payload to `/api/lead`.
- Cloudflare Pages Function `functions/api/lead.js` is implemented and is the only layer that calls amoCRM API.
- amoCRM settings are read only from environment variables.

## Completed recently

- Created AMOCRM_INTEGRATION.md with the safe form -> `/api/lead` -> Cloudflare Pages Function -> amoCRM API architecture.
- Added continuation/recovery rules to CODEX.md.
- Created WORKLOG.md as the project state handoff file.
- Implemented secure lead submission infrastructure:
  - updated `js/script.js` so `submitLead(payload)` posts to `/api/lead`;
  - created `functions/api/lead.js`;
  - added env validation and honest configuration errors;
  - added server-side payload validation;
  - added amoCRM lead creation via `POST /api/v4/leads`;
  - added lead note creation via `POST /api/v4/leads/{lead_id}/notes`;
  - kept tokens out of frontend code.
- Syntax checks passed for `js/script.js` and `functions/api/lead.js`.
- Manual function checks confirmed honest JSON errors for missing env, validation errors and invalid amoCRM URL.

## Next tasks

- Run git status in an environment where Git is available and review all changed files before committing.
- Add real environment variables in Cloudflare Pages settings, not in the repository:
  - `AMOCRM_BASE_URL`;
  - `AMOCRM_ACCESS_TOKEN`;
  - optional `AMOCRM_PIPELINE_ID`;
  - optional `AMOCRM_STATUS_ID`;
  - optional `AMOCRM_RESPONSIBLE_USER_ID`.
- Deploy to Cloudflare Pages or run through `wrangler pages dev .`.
- Send a real test form submission.
- Verify that amoCRM receives a lead in the correct pipeline/status.
- Verify that the lead note contains form fields, UTM, referrer, landing page, timestamp and request id.
- Decide whether the first release keeps contacts manual or adds contact search/create logic.
- Consider adding anti-spam protection, for example Cloudflare Turnstile or rate limiting.

## Risks / notes

- Git is not available in the current PowerShell PATH, so `git status` and `git diff --name-only` could not be executed here.
- Do not commit `_codex_refs/` or any real amoCRM/Cloudflare credentials.
- Do not show fake frontend success unless `/api/lead` returns `ok: true`.
- Without Cloudflare env variables, `/api/lead` intentionally returns a configuration error.
- OAuth refresh flow is not implemented yet; current function expects a valid `AMOCRM_ACCESS_TOKEN`.
- Contact creation is intentionally not implemented until field mapping and duplicate rules are confirmed.

## Next Codex prompt

- Check repository status, review current diffs, then prepare local/Cloudflare verification for `/api/lead` with env variables supplied outside git. Do not add secrets to the repository and do not push without explicit permission.
