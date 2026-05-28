# WORKLOG.md

## Current state

- Project is a static HTML/CSS/JS site for ilma.pro, without React, Next.js, Vite, Tailwind or other heavy frameworks.
- Current amoCRM page is a service page for the amoCRM direction, temporarily published through `index.html`.
- Architecture is prepared for future migration of this page to `/services/amocrm/`.
- Site is hosted on GitHub Pages.
- Lead backend is moving to Yandex Cloud Functions.
- Frontend form now sends leads to a public Yandex Function URL through `LEAD_API_URL`.
- `LEAD_API_URL` is currently guarded by `TODO_YANDEX_FUNCTION_URL`; the real function URL must be inserted after deploy.
- amoCRM secrets must live only in Yandex Cloud Function environment variables.
- Legacy Cloudflare Function `functions/api/lead.js` is kept as deprecated/reference and is not the current production target.

## Completed recently

- Updated frontend form fields:
  - `name`;
  - `phone`;
  - `companyName`;
  - `industry`;
  - `website`;
  - `pain`.
- Updated frontend payload to include required form fields plus UTM, referrer, landing_page and timestamp.
- Added `LEAD_API_URL = window.LEAD_API_URL || "TODO_YANDEX_FUNCTION_URL"` in `js/script.js`.
- Added honest frontend error when Yandex Function URL is not configured.
- Added Yandex Cloud Function implementation in `serverless/yandex-lead-function/index.js`.
- Yandex Function creates contact, optional company, lead, links entities and adds a lead note.
- Yandex Function writes website to company Web field when `companyName` is filled, and to contact website field only when company is not filled.
- Website values without protocol are normalized to `https://...` before sending to amoCRM custom fields.
- Updated AMOCRM_INTEGRATION.md for GitHub Pages + Yandex Cloud Functions + amoCRM architecture.
- Marked Cloudflare implementation as deprecated/reference instead of deleting it.

## Next tasks

- Copy `serverless/yandex-lead-function/index.js` into Yandex Cloud Function editor.
- Set Yandex Cloud Function entrypoint to `index.handler`.
- Add environment variables in Yandex Cloud:
  - `AMOCRM_BASE_URL`;
  - `AMOCRM_ACCESS_TOKEN`;
  - `AMOCRM_PIPELINE_ID`;
  - `AMOCRM_STATUS_ID`;
  - `AMOCRM_RESPONSIBLE_USER_ID`;
  - `AMOCRM_CONTACT_WEBSITE_FIELD_ID`;
  - `AMOCRM_COMPANY_WEBSITE_FIELD_ID`.
- Deploy the Yandex Cloud Function.
- Insert the public Yandex Function URL into frontend by setting `window.LEAD_API_URL` or replacing `TODO_YANDEX_FUNCTION_URL`.
- Deploy GitHub Pages.
- Send a real test form submission from `https://ilma.pro`.
- Verify in amoCRM:
  - contact is created with phone;
  - website is written to contact field when provided and `companyName` is empty;
  - company is created only when `companyName` is provided;
  - website is written to company Web field when `companyName` is provided;
  - lead is created in the correct pipeline/status;
  - lead is linked to contact and optional company;
  - note contains form fields, UTM, referrer, landing_page and timestamp.

## Risks / notes

- Git is not available in the current PowerShell PATH, so `git status` and `git diff --name-only` could not be executed here.
- Do not commit `_codex_refs/` or any real amoCRM/Yandex credentials.
- Do not store `AMOCRM_ACCESS_TOKEN` in code, HTML, JS, README or documentation.
- Current function does not implement OAuth refresh; it expects a valid `AMOCRM_ACCESS_TOKEN`.
- UTM custom fields are not written yet; UTM is guaranteed in the lead note.
- If Yandex Function URL is not configured, the frontend intentionally returns an honest error.
- CORS allows only `https://ilma.pro` and `https://www.ilma.pro`.

## Next Codex prompt

- Review Yandex Function deployment result, insert the public Yandex Function URL into frontend, then verify a real amoCRM lead from https://ilma.pro. Do not add secrets to the repository and do not push without explicit permission.
