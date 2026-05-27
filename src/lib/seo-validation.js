function getValueByPath(object, path) {
  return path.split(".").reduce((value, key) => {
    if (value == null) {
      return undefined;
    }

    return value[key];
  }, object);
}

function normalizeText(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeText).join("|");
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .map((key) => `${key}:${normalizeText(value[key])}`)
      .join("|");
  }

  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function assertRequiredPageFields(page) {
  const required = [
    "type",
    "layer",
    "serviceId",
    "uniqueIntent",
    "outputPath",
    "targetOutputPath",
    "title",
    "description",
    "hero.h1",
    "hero.lead",
    "sections.problemsTitle",
    "data.pains",
    "data.faq"
  ];

  const missing = required.filter((field) => {
    const value = getValueByPath(page, field);
    return value == null || value === "" || (Array.isArray(value) && value.length === 0);
  });

  if (missing.length > 0) {
    throw new Error(`Page "${page.outputPath || page.type}" is missing SEO fields: ${missing.join(", ")}`);
  }
}

function assertNoDuplicatePageSignatures(pages) {
  const signatures = new Map();

  pages.forEach((page) => {
    const signature = normalizeText([
      page.uniqueIntent,
      page.title,
      page.description,
      page.hero && page.hero.h1,
      page.hero && page.hero.lead,
      page.sections && page.sections.problemsTitle
    ]);

    if (signatures.has(signature)) {
      throw new Error(`Duplicate SEO page signature: ${signatures.get(signature)} and ${page.outputPath}`);
    }

    signatures.set(signature, page.outputPath);
  });
}

function validatePages(pages) {
  pages.forEach(assertRequiredPageFields);
  assertNoDuplicatePageSignatures(pages);
}

function validateFutureDrafts(futurePageDrafts) {
  const drafts = [
    ...futurePageDrafts.serviceCityPages,
    ...futurePageDrafts.serviceCityNichePages,
    ...futurePageDrafts.serviceCityPainPages
  ];

  const outputPaths = new Set();
  drafts.forEach((draft) => {
    if (outputPaths.has(draft.outputPath)) {
      throw new Error(`Duplicate future output path: ${draft.outputPath}`);
    }
    outputPaths.add(draft.outputPath);

    if (!draft.serviceId || !draft.uniqueIntent || !draft.uniqueContentSlots) {
      throw new Error(`Future draft "${draft.outputPath}" must have serviceId, uniqueIntent and uniqueContentSlots`);
    }
  });
}

module.exports = {
  validateFutureDrafts,
  validatePages
};
