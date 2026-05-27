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

function build() {
  validatePages(pages);
  validateFutureDrafts(futurePageDrafts);

  const written = pages.map(writePage);
  console.log(`Generated ${written.length} page(s):`);
  written.forEach((file) => console.log(`- ${file}`));
}

build();
