function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonLd(data) {
  return JSON.stringify(data, null, 2)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e");
}

function attrs(classNames) {
  return classNames.filter(Boolean).join(" ");
}

function list(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n");
}

function assetPath(outputPath, asset) {
  const depth = String(outputPath || "index.html")
    .split("/")
    .filter(Boolean)
    .slice(0, -1).length;
  const prefix = depth === 0 ? "" : "../".repeat(depth);
  return `${prefix}${asset}`;
}

module.exports = {
  assetPath,
  attrs,
  escapeHtml,
  jsonLd,
  list
};
