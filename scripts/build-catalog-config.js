const fs = require("node:fs");
const path = require("node:path");

const rawBaseUrl = (process.env.PUBLIC_CATALOG_API_BASE_URL || "").trim();
let catalogApiBaseUrl = "";

if (rawBaseUrl) {
  try {
    const parsedUrl = new URL(rawBaseUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error("invalid protocol");
    catalogApiBaseUrl = rawBaseUrl.replace(/\/+$/, "");
  } catch (_error) {
    throw new Error("PUBLIC_CATALOG_API_BASE_URL debe ser una URL HTTP(S) válida.");
  }
}

const output = `/* Generated during deployment. Do not add secrets to this file. */\nwindow.AIDAR_PUBLIC_CONFIG = Object.freeze({\n  catalogApiBaseUrl: ${JSON.stringify(catalogApiBaseUrl)}\n});\n`;

fs.writeFileSync(path.join(__dirname, "..", "catalog-config.js"), output);
