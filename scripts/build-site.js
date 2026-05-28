const fs = require("fs");
const path = require("path");
const { site } = require("../src/data/site");
const { futurePageDrafts, pages } = require("../src/data/pages");
const { renderPage } = require("../src/templates/layout");
const { validateFutureDrafts, validatePages } = require("../src/lib/seo-validation");

const rootDir = path.resolve(__dirname, "..");

function writePage(page) {
  const outputPath = path.join(rootDir, page.outputPath);
  const html = renderPage(page, site);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, "utf8");

  return path.relative(rootDir, outputPath);
}

function writeRobots() {
  const robots = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${new URL("sitemap.xml", site.urls.canonicalBase).toString()}`,
    ""
  ].join("\n");

  fs.writeFileSync(path.join(rootDir, "robots.txt"), robots, "utf8");
  return "robots.txt";
}

function writeSitemap() {
  const urls = pages
    .map((page) => `  <url>
    <loc>${page.canonical}</loc>
  </url>`)
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  fs.writeFileSync(path.join(rootDir, "sitemap.xml"), sitemap, "utf8");
  return "sitemap.xml";
}

function build() {
  validatePages(pages);
  validateFutureDrafts(futurePageDrafts);

  const written = pages.map(writePage);
  written.push(writeRobots(), writeSitemap());
  console.log(`Generated ${written.length} page(s):`);
  written.forEach((file) => console.log(`- ${file}`));
}

build();
