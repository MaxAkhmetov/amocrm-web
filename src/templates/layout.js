const { assetPath, escapeHtml, jsonLd } = require("./helpers");
const {
  renderBreadcrumbSchema,
  renderFaqSchema,
  renderProfessionalServiceSchema,
  renderWebSiteSchema
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

function renderFooter(page, site) {
  const vkLink = page.footer && page.footer.hideVk
    ? ""
    : `      ВК: <a href="${escapeHtml(site.contacts.vkUrl)}" data-goal="click_vk">${escapeHtml(site.contacts.vkLabel)}</a><br>
`;

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
      Email: <a href="mailto:${escapeHtml(site.contacts.email)}" data-goal="click_email">${escapeHtml(site.contacts.email)}</a><br>
      Телефон: <a href="${escapeHtml(site.contacts.phoneHref)}" data-goal="click_phone">${escapeHtml(site.contacts.phone)}</a><br>
      WhatsApp: <a href="${escapeHtml(site.contacts.whatsappUrl)}" data-goal="click_whatsapp">${escapeHtml(site.contacts.whatsapp)}</a><br>
      Telegram: <a href="${escapeHtml(site.contacts.telegramUrl)}" data-goal="click_telegram">@${escapeHtml(site.contacts.telegram)}</a><br>
${vkLink}
      <a href="${escapeHtml(site.contacts.maxUrl)}" data-goal="click_max">${escapeHtml(site.contacts.maxLabel)}</a>
    </address>
  </footer>`;
}

function renderYandexMetrika(site) {
  const counterId = site.analytics && site.analytics.yandexMetrikaId;

  if (!counterId) {
    return "";
  }

  return `
  <!-- Yandex.Metrika counter -->
  <script type="text/javascript">
      (function(m,e,t,r,i,k,a){
          m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${escapeHtml(String(counterId))}', 'ym');

      ym(${escapeHtml(String(counterId))}, 'init', {ssr:true, webvisor:true, clickmap:true, referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
  </script>
  <noscript><div><img src="https://mc.yandex.ru/watch/${escapeHtml(String(counterId))}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
  <!-- /Yandex.Metrika counter -->`;
}

function renderPage(page, site) {
  const cssPath = assetPath(page.outputPath, "css/style.css");
  const jsPath = assetPath(page.outputPath, "js/script.js");
  const ogImageTag = page.ogImage
    ? `\n  <meta property="og:image" content="${escapeHtml(page.ogImage)}">\n  <meta name="twitter:image" content="${escapeHtml(page.ogImage)}">`
    : "";

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
  <meta property="og:site_name" content="${escapeHtml(site.brand.name)}">${ogImageTag}

  <meta name="twitter:card" content="${page.ogImage ? "summary_large_image" : "summary"}">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.ogDescription || page.description)}">

  <link rel="stylesheet" href="${escapeHtml(cssPath)}">
  <script src="${escapeHtml(jsPath)}" defer></script>

  <script type="application/ld+json">
  ${jsonLd(renderProfessionalServiceSchema(page, site))}
  </script>
  <script type="application/ld+json">
  ${jsonLd(renderFaqSchema(page))}
  </script>
  <script type="application/ld+json">
  ${jsonLd(renderWebSiteSchema(site))}
  </script>
  ${renderBreadcrumbSchema(page, site) ? `<script type="application/ld+json">
  ${jsonLd(renderBreadcrumbSchema(page, site))}
  </script>` : ""}
</head>
<body>
  ${renderYandexMetrika(site)}

  ${renderHeader(page, site)}

  <main>
    ${renderPageSections(page, site)}
  </main>

  ${renderFooter(page, site)}
</body>
</html>
`;
}

module.exports = { renderPage };
