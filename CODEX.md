\# CODEX.md



\## Project

Static Russian-language website for selling amoCRM implementation services.



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