const { attrs, escapeHtml, list } = require("./helpers");

function renderHero(page) {
  const metrics = page.data.heroMetrics
    .map((metric) => {
      const className = attrs(["metric", metric.tone, metric.wide && "wide"]);
      const numericValue = String(metric.value).match(/^\d+$/) ? ` data-counter="${escapeHtml(metric.value)}"` : "";
      return `<div class="${className}"><span>${escapeHtml(metric.label)}</span><strong${numericValue}>${escapeHtml(metric.value)}</strong></div>`;
    })
    .join("\n");

  const benefits = page.data.heroBenefits.map((benefit) => `<span>${escapeHtml(benefit)}</span>`).join("\n");
  const primaryHref = page.hero.primaryHref || "#lead";
  const secondaryHref = page.hero.secondaryHref || "#setup";
  const eyebrow = page.hero.eyebrow ? `<p class="eyebrow">${escapeHtml(page.hero.eyebrow)}</p>` : "";
  const primaryAction = page.hero.primaryCta
    ? `<a class="button button-primary" href="${escapeHtml(primaryHref)}">${escapeHtml(page.hero.primaryCta)}</a>`
    : "";
  const secondaryAction = page.hero.secondaryCta
    ? `<a class="button button-ghost" href="${escapeHtml(secondaryHref)}">${escapeHtml(page.hero.secondaryCta)}</a>`
    : "";
  const dashboardLabel = page.hero.dashboardLabel || "Контроль сегодня";
  const dashboardTitle = page.hero.dashboardTitle || "amoCRM порядок";

  return `
    <section class="hero" id="top">
      <div class="hero-copy" data-animate="reveal">
        ${eyebrow}
        <h1>${escapeHtml(page.hero.h1)}</h1>
        <p class="hero-lead">${escapeHtml(page.hero.lead)}</p>
        <div class="hero-actions">
          ${primaryAction}
          ${secondaryAction}
        </div>
        <p class="hero-note">${escapeHtml(page.hero.note)}</p>
      </div>

      <div class="dashboard-card" aria-label="Mockup CRM-дашборда" data-animate="reveal">
        <div class="dashboard-top">
          <div>
            <p class="dashboard-label">${escapeHtml(dashboardLabel)}</p>
            <strong>${escapeHtml(dashboardTitle)}</strong>
          </div>
          <span>live</span>
        </div>
        <div class="metric-grid">
          ${metrics}
        </div>
      </div>

      <div class="hero-benefits" aria-label="Преимущества" data-animate="reveal-list">
        ${benefits}
      </div>
    </section>`;
}

function renderCardsSection({ id, eyebrow, title, items, gridClass }) {
  const cards = items
    .map((item) => `
        <article class="card" data-animate="reveal">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>`)
    .join("\n");

  return `
    <section class="section" id="${escapeHtml(id)}">
      <div class="section-heading">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h2>${escapeHtml(title)}</h2>
      </div>
      <div class="cards-grid ${escapeHtml(gridClass)}">
        ${cards}
      </div>
    </section>`;
}

function renderSolution(page) {
  const steps = page.data.solutionSteps
    .map((step, index) => `
        <article data-animate="reveal">
          <span>${index + 1}</span>
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.text)}</p>
        </article>`)
    .join("\n");

  return `
    <section class="section split-section" id="solution">
      <div class="section-heading">
        <p class="eyebrow">Решение</p>
        <h2>${escapeHtml(page.sections.solutionTitle)}</h2>
        <p>${escapeHtml(page.sections.solutionText)}</p>
      </div>
      <div class="flow">
        ${steps}
      </div>
    </section>`;
}

function renderSetup(page) {
  const items = page.data.setupItems.map((item) => `<span>${escapeHtml(item)}</span>`).join("\n");

  return `
    <section class="section" id="setup">
      <div class="section-heading">
        <p class="eyebrow">Что настроим</p>
        <h2>${escapeHtml(page.sections.setupTitle)}</h2>
      </div>
      <div class="check-grid">
        ${items}
      </div>
      <p class="note-box">${escapeHtml(page.sections.setupNote)}</p>
    </section>`;
}

function renderPackages(page) {
  const cards = page.data.packages
    .map((pack) => {
      const className = attrs(["price-card", pack.recommended && "recommended"]);
      const badge = pack.recommended ? '<span class="badge">Рекомендуемый</span>' : "";
      const buttonClass = pack.recommended ? "button button-primary" : "button button-ghost";

      return `
        <article class="${className}" data-animate="reveal">
          ${badge}
          <h3>${escapeHtml(pack.title)}</h3>
          <p class="price">${escapeHtml(pack.price)}</p>
          <p>${escapeHtml(pack.audience)}</p>
          <ul>
            ${list(pack.items)}
          </ul>
          <p class="term">Срок: ${escapeHtml(pack.term)}</p>
          <a class="${buttonClass}" href="#lead">${escapeHtml(pack.cta)}</a>
        </article>`;
    })
    .join("\n");

  return `
    <section class="section" id="packages">
      <div class="section-heading">
        <p class="eyebrow">Тарифы</p>
        <h2>${escapeHtml(page.sections.packagesTitle)}</h2>
      </div>
      <div class="price-grid">
        ${cards}
      </div>
    </section>`;
}

function renderResult(page) {
  const rows = page.data.result.table
    .map((row) => `<div class="table-row">${row.map((cell) => `<span>${escapeHtml(cell)}</span>`).join("")}</div>`)
    .join("\n");

  return `
    <section class="section result-section" id="result">
      <div class="section-heading">
        <p class="eyebrow">Результат</p>
        <h2>${escapeHtml(page.sections.resultTitle)}</h2>
      </div>
      <div class="before-after">
        <article class="compare-card">
          <h3>До</h3>
          <ul>
            ${list(page.data.result.before)}
          </ul>
        </article>
        <article class="compare-card after">
          <h3>После</h3>
          <ul>
            ${list(page.data.result.after)}
          </ul>
        </article>
        <div class="source-table" role="img" aria-label="Mockup таблицы эффективности источников">
          <div class="table-row head"><span>Источник</span><span>Заявки</span><span>КП</span><span>Продажи</span><span>Потери</span></div>
          ${rows}
        </div>
      </div>
    </section>`;
}

function renderProcess(page) {
  const steps = page.data.processSteps
    .map((step, index) => `
        <article data-animate="reveal">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.text)}</p>
        </article>`)
    .join("\n");

  return `
    <section class="section" id="process">
      <div class="section-heading">
        <p class="eyebrow">Процесс</p>
        <h2>${escapeHtml(page.sections.processTitle)}</h2>
      </div>
      <div class="process-list">
        ${steps}
      </div>
    </section>`;
}

function renderWhy(page) {
  return renderCardsSection({
    id: "why",
    eyebrow: "Почему я",
    title: page.sections.whyTitle,
    items: page.data.why,
    gridClass: "four"
  }).replace("</div>\n    </section>", `</div>
      <p class="section-after-text">${escapeHtml(page.sections.whyText)}</p>
    </section>`);
}

function renderLeadForm(page) {
  const form = page.form || {};
  const offer = form.offer || "no_crm_loss_map";
  const buttonText = form.buttonText || "Получить карту потерь и разбор";
  const eyebrow = form.eyebrow ? `<p class="eyebrow">${escapeHtml(form.eyebrow)}</p>` : "";

  return `
    <section class="section lead-section" id="lead">
      <div class="lead-copy">
        ${eyebrow}
        <h2>${escapeHtml(page.sections.leadMagnetTitle)}</h2>
        <p>${escapeHtml(page.sections.leadMagnetText)}</p>
      </div>
      <form class="lead-form" id="lead-form" novalidate>
        <div class="form-row">
          <label for="name">Имя *</label>
          <input id="name" name="name" type="text" minlength="2" required autocomplete="name">
          <small class="field-error" data-error-for="name"></small>
        </div>
        <div class="form-row">
          <label for="phone">Телефон *</label>
          <input id="phone" name="phone" type="tel" inputmode="tel" required autocomplete="tel" placeholder="+7 (___) ___ __ __">
          <small class="field-error" data-error-for="phone"></small>
        </div>
        <div class="form-row">
          <label for="companyName">Название компании</label>
          <input id="companyName" name="companyName" type="text" autocomplete="organization">
        </div>
        <div class="form-row">
          <label for="industry">Ниша компании</label>
          <input id="industry" name="industry" type="text">
        </div>
        <div class="form-row">
          <label for="website">Сайт компании, если есть</label>
          <input id="website" name="website" type="url" inputmode="url" placeholder="https://">
          <small class="field-error" data-error-for="website"></small>
        </div>
        <div class="form-row full">
          <label for="pain">Что сейчас болит в продажах?</label>
          <textarea id="pain" name="pain" rows="4"></textarea>
        </div>
        <input type="hidden" name="utm_source">
        <input type="hidden" name="utm_medium">
        <input type="hidden" name="utm_campaign">
        <input type="hidden" name="utm_content">
        <input type="hidden" name="utm_term">
        <input type="hidden" name="referrer">
        <input type="hidden" name="landing_page">
        <input type="hidden" name="form_page">
        <input type="hidden" name="timestamp">
        <input type="hidden" name="offer" value="${escapeHtml(offer)}">
        <button class="button button-primary full" type="submit">${escapeHtml(buttonText)}</button>
        <p class="form-status" id="form-status" role="status" aria-live="polite"></p>
      </form>
    </section>`;
}

function renderHomeDirections(page) {
  const cards = page.data.directions
    .map((item) => {
      const className = attrs(["direction-card", !item.available && "is-disabled"]);
      const link = item.available
        ? `<a class="button button-ghost" href="${escapeHtml(item.href)}">Подробнее</a>`
        : `<span class="button button-ghost disabled-link" aria-disabled="true">Скоро</span>`;

      return `
        <article class="${className}" data-animate="reveal">
          <div>
            <span class="direction-status">${escapeHtml(item.status)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </div>
          ${link}
        </article>`;
    })
    .join("\n");

  return `
    <section class="section" id="directions">
      <div class="section-heading">
        <p class="eyebrow">Направления</p>
        <h2>${escapeHtml(page.sections.directionsTitle)}</h2>
        <p>${escapeHtml(page.sections.directionsText)}</p>
      </div>
      <div class="direction-grid">
        ${cards}
      </div>
    </section>`;
}

function renderHomePrinciple(page) {
  return `
    <section class="section principle-section" id="order-first">
      <div class="section-heading">
        <p class="eyebrow">Подход</p>
        <h2>${escapeHtml(page.sections.principleTitle)}</h2>
        <p>${escapeHtml(page.sections.principleText)}</p>
      </div>
    </section>`;
}

function renderFaq(page) {
  const items = page.data.faq
    .map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`)
    .join("\n");

  return `
    <section class="section" id="faq">
      <div class="section-heading">
        <p class="eyebrow">FAQ</p>
        <h2>${escapeHtml(page.sections.faqTitle)}</h2>
      </div>
      <div class="faq-list">
        ${items}
      </div>
    </section>`;
}

function renderRelatedLinks(page) {
  if (!page.relatedLinks || page.relatedLinks.length === 0) {
    return "";
  }

  const links = page.relatedLinks
    .map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
    .join("\n");

  return `
    <section class="section related-links" id="related">
      <div class="section-heading">
        <p class="eyebrow">Связанные страницы</p>
        <h2>${escapeHtml(page.relatedLinksTitle || "Полезные разделы по внедрению amoCRM")}</h2>
      </div>
      <div class="related-grid">
        ${links}
      </div>
    </section>`;
}

function renderFinalCta(page, site) {
  return `
    <section class="section final-cta" id="contact">
      <div>
        <p class="eyebrow">Финальный разбор</p>
        <h2>${escapeHtml(page.sections.finalCtaTitle)}</h2>
        <p>${escapeHtml(page.sections.finalCtaText)}</p>
      </div>
      <div class="cta-actions">
        <a class="button button-primary" href="#lead">Получить экспресс-разбор</a>
        <a class="button button-ghost" href="${escapeHtml(site.contacts.telegramUrl)}" data-goal="click_telegram">Написать в Telegram</a>
      </div>
    </section>`;
}

function renderPageSections(page, site) {
  if (page.type === "home") {
    return [
      renderHomeDirections(page),
      renderHomePrinciple(page),
      renderLeadForm(page),
      renderFaq(page),
      renderFinalCta(page, site)
    ].join("\n");
  }

  return [
    renderCardsSection({
      id: "problems",
      eyebrow: "Проблемы",
      title: page.sections.problemsTitle,
      items: page.data.pains,
      gridClass: "six"
    }),
    renderSolution(page),
    renderSetup(page),
    renderCardsSection({
      id: "industries",
      eyebrow: "Ниши",
      title: page.sections.industriesTitle,
      items: page.data.industries,
      gridClass: "industries"
    }),
    renderPackages(page),
    renderResult(page),
    renderProcess(page),
    renderWhy(page),
    renderLeadForm(page),
    renderFaq(page),
    renderRelatedLinks(page),
    renderFinalCta(page, site)
  ].join("\n");
}

module.exports = {
  renderHero,
  renderPageSections
};
