const test = require("node:test");
const assert = require("node:assert/strict");
const { CatalogApiError, PublicCatalogClient } = require("../catalog.js");

const product = {
  slug: "cemento-portland-50kg",
  name: "Cemento Portland 50 kg",
  brand: "Loma Negra",
  category: "Cemento",
  unit: "bolsa",
  price: "12480.00",
  currency: "ARS",
  price_includes_vat: true,
  updated_at: "2026-09-06T12:15:00Z",
  availability_notice: "Stock, entrega y condiciones a confirmar por WhatsApp"
};

test("contrato: busca productos publicados y conserva el precio textual del backend", async () => {
  let requestedUrl;
  let requestedOptions;
  const client = new PublicCatalogClient({
    baseUrl: "https://gestiko-staging.example/",
    fetchImpl: async (url, options) => {
      requestedUrl = url;
      requestedOptions = options;
      return { ok: true, json: async () => ({ items: [product] }) };
    }
  });

  const products = await client.search({ query: "cemento", category: "Cemento", page: 1, size: 12 });

  assert.deepEqual(products, [product]);
  assert.equal(requestedUrl.toString(), "https://gestiko-staging.example/api/public/v1/catalog?q=cemento&category=Cemento&page=1&size=12");
  assert.equal(requestedOptions.cache, "no-store");
});

test("contrato: acepta una búsqueda sin resultados", async () => {
  const client = new PublicCatalogClient({
    baseUrl: "https://gestiko-staging.example",
    fetchImpl: async () => ({ ok: true, json: async () => ({ items: [] }) })
  });

  assert.deepEqual(await client.search({ query: "producto inexistente" }), []);
});

test("contrato: expone una caída de API para que la landing active WhatsApp", async () => {
  const client = new PublicCatalogClient({
    baseUrl: "https://gestiko-staging.example",
    fetchImpl: async () => {
      throw new Error("network down");
    }
  });

  await assert.rejects(
    () => client.search({ query: "cemento" }),
    (error) => error instanceof CatalogApiError && error.message === "No se pudo conectar con el catálogo público."
  );
});
