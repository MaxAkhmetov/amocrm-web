const { assetPath, escapeHtml, jsonLd } = require("./helpers");
const {
  renderBreadcrumbSchema,
  renderFaqSchema,
  renderProfessionalServiceSchema
} = require("./schemas");
const { renderHero, renderPageSections } = require("./sections");

function renderHeader(page, site) {
  const platformNav = site.platformNavigation
    .map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
    .join("\n");
  const breadcrumbs = (page.breadcrumbs || [])
    .map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
    .join("<span>/</span>");

  return `
  <header class="site-header">
    <nav class="nav nav-platform" aria-label="Навигация платформы">
      <a class="brand" href="/" aria-label="${escapeHtml(site.brand.name)}">
        <span class="brand-mark" aria-hidden="true">${escapeHtml(site.brand.shortMark)}</span>
        <span>
          <strong>${escapeHtml(site.brand.name)}</strong>
          <small>${escapeHtml(site.brand.subtitle)}</small>
        </span>
      </a>
      <button class="nav-toggle" type="button" aria-controls="nav-menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
        <span class="sr-only">Открыть меню</span>
      </button>
      <div class="nav-menu nav-menu-platform" id="nav-menu">
        ${platformNav}
        <a class="nav-cta" href="#lead">Получить разбор</a>
      </div>
    </nav>
    ${breadcrumbs ? `<div class="breadcrumbs" aria-label="Хлебные крошки">${breadcrumbs}</div>` : ""}
    ${renderHero(page, site)}
  </header>`;
}

function renderFooter(site) {
  return `
  <footer class="footer">
    <div>
      <strong>${escapeHtml(site.brand.name)}</strong>
      <p>${escapeHtml(site.brand.description)}</p>
    </div>
    <nav aria-label="Ссылки в подвале">
      <a href="#privacy">Политика конфиденциальности</a>
      <a href="#contact">Контакты</a>
    </nav>
    <address>
      Email: <a href="mailto:${escapeHtml(site.contacts.email)}">${escapeHtml(site.contacts.email)}</a><br>
      Телефон: <a href="${escapeHtml(site.contacts.phoneHref)}">${escapeHtml(site.contacts.phone)}</a><br>
      WhatsApp: <a href="${escapeHtml(site.contacts.whatsappUrl)}">${escapeHtml(site.contacts.whatsapp)}</a><br>
      Telegram: <a href="${escapeHtml(site.contacts.telegramUrl)}">@${escapeHtml(site.contacts.telegram)}</a><br>
      ВК: <a href="${escapeHtml(site.contacts.vkUrl)}">${escapeHtml(site.contacts.vkLabel)}</a><br>
      <a href="${escapeHtml(site.contacts.maxUrl)}">${escapeHtml(site.contacts.maxLabel)}</a>
    </address>
  </footer>`;
}

function renderPage(page, site) {
  const cssPath = assetPath(page.outputPath, "css/style.css");
  const jsPath = assetPath(page.outputPath, "js/script.js");

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${escapeHtml(page.canonical)}">

  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.ogDescription || page.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(page.ogUrl)}">
  <meta property="og:image" content="${escapeHtml(page.ogImage)}">

  <link rel="stylesheet" href="${escapeHtml(cssPath)}">
  <script src="${escapeHtml(jsPath)}" defer></script>

  <script type="application/ld+json">
  ${jsonLd(renderProfessionalServiceSchema(page, site))}
  </script>
  <script type="application/ld+json">
  ${jsonLd(renderFaqSchema(page))}
  </script>
  ${renderBreadcrumbSchema(page) ? `<script type="application/ld+json">
  ${jsonLd(renderBreadcrumbSchema(page))}
  </script>` : ""}
</head>
<body>
  ${renderHeader(page, site)}

  <main>
    ${renderPageSections(page, site)}
  </main>

  ${renderFooter(site)}
</body>
</html>
`;
}

module.exports = { renderPage };
