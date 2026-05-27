const { assetPath, escapeHtml, jsonLd } = require("./helpers");
const { renderHero, renderPageSections } = require("./sections");

function renderProfessionalServiceSchema(page, site) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": site.brand.name,
    "description": site.brand.description,
    "areaServed": site.brand.areaServed,
    "serviceType": site.brand.serviceName,
    "url": page.canonical,
    "email": site.contacts.email,
    ...(page.city ? { "address": { "@type": "PostalAddress", "addressLocality": page.city } } : {})
  };
}

function renderFaqSchema(page) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": page.data.faq.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
}

function renderHeader(page, site) {
  const nav = site.navigation
    .map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
    .join("\n");

  return `
  <header class="site-header">
    <nav class="nav" aria-label="Основная навигация">
      <a class="brand" href="#top" aria-label="${escapeHtml(site.brand.name)}">
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
      <div class="nav-menu" id="nav-menu">
        ${nav}
        <a class="nav-cta" href="#lead">Получить разбор</a>
      </div>
    </nav>
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
      Telegram: ${escapeHtml(site.contacts.telegram)}<br>
      WhatsApp: ${escapeHtml(site.contacts.whatsapp)}<br>
      Email: ${escapeHtml(site.contacts.email)}
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
