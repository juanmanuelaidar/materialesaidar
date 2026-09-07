(function catalogModule(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.AidarCatalog = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  class CatalogApiError extends Error {
    constructor(message, status) {
      super(message);
      this.name = "CatalogApiError";
      this.status = status;
    }
  }

  class CatalogUnavailableError extends CatalogApiError {
    constructor() {
      super("El catálogo público no está configurado para este entorno.");
      this.name = "CatalogUnavailableError";
    }
  }

  function getCatalogApiBaseUrl(config) {
    const baseUrl = config && config.catalogApiBaseUrl;
    return typeof baseUrl === "string" ? baseUrl.trim().replace(/\/+$/, "") : "";
  }

  function isCatalogProduct(product) {
    return Boolean(product)
      && ["slug", "name", "brand", "category", "unit", "price", "currency", "updated_at", "availability_notice"]
        .every((field) => typeof product[field] === "string")
      && typeof product.price_includes_vat === "boolean";
  }

  function readProducts(payload) {
    const products = Array.isArray(payload)
      ? payload
      : payload && (payload.items || payload.products || payload.results);

    if (!Array.isArray(products) || !products.every(isCatalogProduct)) {
      throw new CatalogApiError("La respuesta del catálogo no cumple el contrato esperado.");
    }

    return products;
  }

  class PublicCatalogClient {
    constructor({ baseUrl, fetchImpl = fetch } = {}) {
      this.baseUrl = getCatalogApiBaseUrl({ catalogApiBaseUrl: baseUrl });
      this.fetchImpl = fetchImpl;
    }

    async search({ query, category, page = 1, size = 12 }) {
      const url = this.urlFor("/api/public/v1/catalog");
      url.searchParams.set("q", query);
      if (category) url.searchParams.set("category", category);
      url.searchParams.set("page", String(page));
      url.searchParams.set("size", String(size));

      const payload = await this.request(url);
      return readProducts(payload);
    }

    async getProduct(slug) {
      const payload = await this.request(
        this.urlFor(`/api/public/v1/catalog/products/${encodeURIComponent(slug)}`)
      );

      if (!isCatalogProduct(payload)) {
        throw new CatalogApiError("La respuesta del producto no cumple el contrato esperado.");
      }

      return payload;
    }

    urlFor(path) {
      if (!this.baseUrl) throw new CatalogUnavailableError();

      try {
        return new URL(path, `${this.baseUrl}/`);
      } catch (_error) {
        throw new CatalogUnavailableError();
      }
    }

    async request(url) {
      let response;

      try {
        response = await this.fetchImpl(url, {
          headers: { Accept: "application/json" },
          cache: "no-store"
        });
      } catch (_error) {
        throw new CatalogApiError("No se pudo conectar con el catálogo público.");
      }

      if (!response.ok) {
        throw new CatalogApiError("El catálogo público no está disponible.", response.status);
      }

      try {
        return await response.json();
      } catch (_error) {
        throw new CatalogApiError("El catálogo público devolvió una respuesta inválida.");
      }
    }
  }

  return {
    CatalogApiError,
    CatalogUnavailableError,
    PublicCatalogClient,
    getCatalogApiBaseUrl,
    isCatalogProduct
  };
});
