\# CODEX.md



## Project

Static Russian-language B2B website for ilma.pro. The domain is a multi-service platform for CRM implementation, operational efficiency, AI automation, process digitalization and management control systems. amoCRM is one service direction, not the whole website.



\## Business goal

Generate leads for amoCRM setup, CRM automation, funnel design, integrations, and small business sales process optimization.



\## Style

\- Russian language.

\- Clear, direct, commercial tone.

\- No vague marketing phrases.

\- Focus on pain points: lost leads, chaos in sales, lack of control, weak follow-up, manual work.

\- Positioning: practical expert who builds order in sales systems.



\## Technical rules

\- Static HTML/CSS/JS unless explicitly changed.

\- Keep code simple.

\- Do not add frameworks without permission.

\- Do not rewrite unrelated files.

\- Check that pages open locally.



\## Git rules

\- Make small commits.

\- Explain changed files before finishing.

\- Do not commit secrets, passwords, tokens, or API keys.

Use SITE_SPEC.md as the main source of truth for website content, design and acceptance criteria.

## Workflow after every task

After completing any task:
1. Explain what files were changed.
2. Explain how to preview the result locally.
3. Explain what Git commands should be executed manually.
4. Do not push directly to main unless explicitly allowed.
5. Prefer creating a separate branch for large changes.

Always print the exact commands for:
- git status
- git add .
- git commit
- git push



Never assume changes are approved automatically.
After implementation, stop and wait for review before destructive refactoring or major architecture changes.

## UI/UX principles

The website should feel like:
- premium SaaS;
- control system;
- operational dashboard;
- modern consulting product.

Avoid:
- cheap landing page effects;
- aggressive animations;
- excessive glow;
- random gradients;
- stock startup aesthetics.

Prefer:
- subtle motion;
- premium spacing;
- clean transitions;
- dashboard-like visuals;
- smooth hover states;
- controlled animations.

Animations should improve perceived quality, not distract.

## Visual style guardrails

Do not make the website look like:
- a startup template;
- a crypto landing page;
- an AI hype website;
- a generic SaaS clone.

The tone should feel:
- calm;
- controlled;
- analytical;
- premium;
- operational.

## Content quality

Avoid generic marketing copy.

Texts should feel:
- practical;
- operational;
- business-oriented;
- financially aware;
- written by someone who understands sales processes.

Avoid phrases like:
- "boost your business"
- "innovative solutions"
- "take your sales to the next level"
- "transform your workflow"

Prefer concrete operational language:
- lost leads;
- overdue tasks;
- conversion losses;
- source tracking;
- sales bottlenecks;
- manager accountability.

## Image generation workflow

If the website needs a visual asset, do not use random stock images or external images from the internet.

Instead:
1. Describe exactly what visual asset is needed.
2. Explain where it will be used on the website.
3. Write a detailed prompt for ChatGPT image generation.
4. If Midjourney refinement would improve the result, write a separate Midjourney prompt.
5. Specify the recommended image size and aspect ratio.
6. Specify the filename.
7. Specify the exact folder where the image should be placed.
8. Add the image to the code only after the file exists in the project.

Preferred folder:
- /assets/images/

Preferred formats:
- .webp for final website images;
- .png only if transparency is needed;
- .svg for simple icons, lines, diagrams and abstract interface elements.

Do not block development if the image is not ready.
Use a clean CSS/HTML placeholder and add a TODO comment.


## Required image request format

When an image is needed, respond in this format:

Image needed:
- Purpose:
- Website block:
- Recommended size:
- Aspect ratio:
- Filename:
- Folder:
- ChatGPT prompt:
- Midjourney prompt:
- How to export:
- Where to place the file:
- What code will use it:

## Multi-service architecture

Do not assume the entire website is dedicated only to amoCRM.

The domain is a broader business platform.

amoCRM is only one service direction.

Architecture decisions should support future expansion into:
- operational efficiency;
- AI automation;
- process digitalization;
- management systems;
- consulting products.

Avoid tightly coupling the entire website structure only to amoCRM.

## Future migration readiness

The current amoCRM landing page may temporarily live at the root domain for launch speed.

But the implementation should allow easy future migration to:
/services/amocrm/

Avoid hardcoded assumptions that this page will permanently remain the homepage.


## Page creation rules

When creating any new page:
- First identify the page type: brand homepage, service page, city page, niche page, pain-point page, blog article, case page.
- Reuse existing layout, header, footer, CTA, form, FAQ and design system.
- Do not create a new visual style for each page.
- Do not duplicate generic text with only city/service name changed.
- Keep each page unique by intent, examples, FAQ, title, description and internal links.
- Keep typography consistent with the approved amoCRM page.
- Use one global header for the whole domain.
- Do not add a second service-specific header.
- Use service/page labels inside the page content, not as separate headers.
- Do not add custom cursor animations.
- Use restrained premium motion only: fade-up, hover lift, soft border glow, smooth accordion, number counters where useful.
- Before coding, propose the page URL, page type, SEO intent, H1, title, description and reused blocks.

## Approved typography rules

The website must not use overly heavy typography.

Use a calm premium B2B hierarchy:
- H1: large but not aggressive, font-weight 700, line-height 1.08-1.12.
- H2: font-weight 700, line-height 1.15-1.2.
- H3/card titles: font-weight 650-700.
- Body text: 17-18px on desktop, line-height 1.55-1.7.
- Secondary text: minimum 14px, readable contrast.
- Avoid making all headings and buttons extra-bold.
- Avoid visual shouting through excessive uppercase, heavy weight and tight line-height.

The page should feel expensive, calm and readable, not loud or heavy.

## Approved motion rules

Use restrained premium motion.

Do not add:
- custom cursor animation;
- bouncing effects;
- aggressive parallax;
- excessive scroll effects;
- animations that make every section behave the same way.

Use:
- slower fade-up on scroll;
- staggered reveal for card groups;
- smooth hover lift on cards;
- soft border/glow transition on cards;
- button hover transitions;
- number counters in dashboard metrics;
- subtle pulse only for selected dashboard metrics;
- smooth accordion transitions.

Animation timing:
- reveal duration: 600-900ms;
- stagger delay: 80-140ms;
- easing: cubic-bezier(0.22, 1, 0.36, 1);
- hover transitions: 180-260ms.

Always support prefers-reduced-motion.

## Visual rhythm rules

Avoid making every section look like the same dark card grid.

Use controlled variation:
- alternate section layouts;
- split text + visual blocks;
- dashboard/mockup sections;
- compact list sections;
- card grids only where they improve scanning;
- stronger spacing between major sections;
- softer borders and less aggressive grid background.

The visual system must stay consistent, but the page should not feel monotonous.

## amoCRM developer documentation

For amoCRM API tasks, use:
- AMOCRM_INTEGRATION.md as the project-specific integration guide;
- _codex_refs/amocrm/combined_all_text_files.md only as raw reference documentation.

Do not commit files from _codex_refs/.

Do not expose amoCRM tokens or secrets in frontend code.

Frontend forms must send data only to the local backend endpoint:
/api/lead

amoCRM API calls must happen only in server-side code, for example Cloudflare Pages Functions.

## Integration security

For any third-party integration:
- Never expose tokens or secrets in frontend code.
- Never commit credentials.
- Use server-side functions for API calls that require secrets.
- Store secrets only in environment variables.
- If credentials are missing, return a clear error instead of fake success.

## Continuation and recovery

If the session is interrupted, context is lost, or the task is continued later:

1. Read CODEX.md, SITE_SPEC.md, AMOCRM_INTEGRATION.md and WORKLOG.md first.
2. Always run git status before making changes.
3. Inspect existing files before coding or editing documentation.
4. Continue from the current repository state.
5. Do not restart the task from scratch unless explicitly requested.
6. Before large changes, first explain what is already implemented and what remains.
7. After each completed logical stage, suggest exact git commands for commit and push.
8. Do not run git push without explicit user permission.
