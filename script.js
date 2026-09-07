const BUSINESS = {
  whatsappNumber: "5492614536576",
  phoneNumber: "+54 9 261 453 6576",
  email: "materialesaidar@gmail.com",
  mapsUrl: "https://www.google.com/maps/place/AIDAR+Materiales+de+Construcci%C3%B3n/@-32.9897653,-68.7983173,3635m/data=!3m1!1e3!4m6!3m5!1s0x967e0c9580f2975d:0x5a2c11376029d9f6!8m2!3d-32.9796379!4d-68.7901994!16s%2Fg%2F11b7j3j239?entry=ttu&g_ep=EgoyMDI2MDgwMi4wIKXMDSoASAFQAw%3D%3D",
  address: "Angel Godoy 70 Maipú, Mendoza",
  defaultMessage: "Hola, quisiera consultar precio y disponibilidad de materiales."
};

// Access key gratuito de https://web3forms.com (asociado a materialesaidar@gmail.com).
// Sin esto el formulario no puede enviar el mail: hay que reemplazar el placeholder.
const WEB3FORMS_ACCESS_KEY = "6a145e43-428b-41dd-b4a7-e05851eaf634";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

function onlyDigits(value) {
  return String(value).replace(/\D/g, "");
}

function whatsappUrl(message = BUSINESS.defaultMessage) {
  return `https://wa.me/${onlyDigits(BUSINESS.whatsappNumber)}?text=${encodeURIComponent(message)}`;
}

function setLink(id, href, newTab = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.href = href;

  if (newTab) {
    el.target = "_blank";
    el.rel = "noopener";
  }
}

function trackLead(source) {
  console.log("lead_click", source);

  if (typeof window.gtag === "function") {
    window.gtag("event", "generate_lead", {
      lead_source: source
    });
  }
}

function trackCatalogEvent(eventName, parameters = {}) {
  console.log(eventName, parameters);

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, parameters);
  }
}

function productWhatsAppMessage(product) {
  return `Hola, quisiera consultar por ${product.name} (${product.brand}, ${product.unit}).`;
}

function searchWhatsAppMessage(query) {
  return `Hola, quisiera consultar por: ${query}`;
}

function setCatalogStatus(statusEl, text, kind) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.toggle("is-error", kind === "error");
}

function catalogProductCard(product, query) {
  const card = document.createElement("article");
  card.className = "catalog-product";
  card.dataset.catalogProduct = product.slug;

  const category = document.createElement("span");
  category.className = "section-kicker";
  category.textContent = product.category;

  const title = document.createElement("h3");
  title.textContent = product.name;

  const brand = document.createElement("p");
  brand.className = "catalog-product-brand";
  brand.textContent = product.brand;

  const price = document.createElement("p");
  price.className = "catalog-product-price";
  // Deliberately use the exact price string returned by GestiKo. Do not format or round it here.
  price.textContent = `${product.currency} ${product.price}`;

  const metadata = document.createElement("ul");
  metadata.className = "catalog-product-meta";
  [
    ["Unidad", product.unit],
    ["Precio final", product.price_includes_vat ? "Incluye IVA" : "No incluye IVA"],
    ["Actualizado", product.updated_at]
  ].forEach(([label, value]) => {
    const item = document.createElement("li");
    const labelEl = document.createElement("strong");
    labelEl.textContent = `${label}: `;
    item.append(labelEl, document.createTextNode(value));
    metadata.append(item);
  });

  const notice = document.createElement("p");
  notice.className = "catalog-product-notice";
  notice.textContent = product.availability_notice;

  const whatsapp = document.createElement("a");
  whatsapp.className = "btn btn-whatsapp";
  whatsapp.href = whatsappUrl(productWhatsAppMessage(product));
  whatsapp.target = "_blank";
  whatsapp.rel = "noopener";
  whatsapp.textContent = "Consultar este producto por WhatsApp";
  whatsapp.addEventListener("click", () => {
    trackCatalogEvent("catalog_whatsapp_click", {
      product_slug: product.slug,
      query
    });
    trackLead("whatsapp_catalog_product");
  });

  card.append(category, title, brand, price, metadata, notice, whatsapp);
  return card;
}

function mailtoUrl({ name, email, subject, message }) {
  const body = [
    `Nombre: ${name}`,
    `Email: ${email}`,
    "",
    message
  ].join("\n");

  return `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function getMendozaTimeParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Mendoza",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  const weekdayMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  return {
    day: weekdayMap[values.weekday],
    minutes: Number(values.hour) * 60 + Number(values.minute)
  };
}

function getHoursStatus(date = new Date()) {
  const { day, minutes } = getMendozaTimeParts(date);
  const weekdayRanges = [
    [],
    [[8 * 60 + 30, 12 * 60 + 30], [15 * 60, 19 * 60]],
    [[8 * 60 + 30, 12 * 60 + 30], [15 * 60, 19 * 60]],
    [[8 * 60 + 30, 12 * 60 + 30], [15 * 60, 19 * 60]],
    [[8 * 60 + 30, 12 * 60 + 30], [15 * 60, 19 * 60]],
    [[8 * 60 + 30, 12 * 60 + 30], [15 * 60, 19 * 60]],
    [[8 * 60 + 30, 12 * 60 + 30]]
  ];

  const ranges = weekdayRanges[day] || [];
  const open = ranges.some(([start, end]) => minutes >= start && minutes < end);

  return open ? "Abierto ahora" : "Cerrado ahora";
}

document.addEventListener("DOMContentLoaded", () => {
  const wa = whatsappUrl();
  const cleanPhone = BUSINESS.phoneNumber.replace(/[^\d+]/g, "");
  const emailForm = document.getElementById("email-form");
  const hoursStatus = document.getElementById("hours-status");

  [
    "top-whatsapp",
    "header-whatsapp",
    "hero-whatsapp",
    "categories-whatsapp",
    "contact-whatsapp",
    "floating-whatsapp"
  ].forEach((id) => {
    setLink(id, wa, true);

    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => trackLead("whatsapp"));
    }
  });

  [
    "hero-maps",
    "location-maps",
    "contact-rating"
  ].forEach((id) => {
    setLink(id, BUSINESS.mapsUrl, true);

    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => trackLead("maps"));
    }
  });

  setLink("top-phone", `tel:${cleanPhone}`);
  setLink("location-phone", `tel:${cleanPhone}`);

  if (emailForm) {
    const submitButton = emailForm.querySelector('button[type="submit"]');
    const statusEl = emailForm.querySelector("[data-email-status]");

    const setStatus = (text, kind) => {
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.classList.toggle("is-error", kind === "error");
      statusEl.classList.toggle("is-success", kind === "success");
    };

    emailForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(emailForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const subject = String(formData.get("subject") || "").trim();
      const message = String(formData.get("message") || "").trim();

      if (!name || !email || !subject || !message) return;

      if (submitButton) submitButton.disabled = true;
      setStatus("Enviando...", null);

      try {
        const response = await fetch(WEB3FORMS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            name,
            email,
            subject: `[Web AIDAR] ${subject}`,
            message,
            replyto: email
          })
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || !result || !result.success) {
          throw new Error((result && result.message) || "No se pudo enviar el mensaje.");
        }

        setStatus("¡Mensaje enviado! Te vamos a responder a la brevedad.", "success");
        trackLead("email_form_submit");
        emailForm.reset();

      } catch (error) {
        console.error("email_form_error", error);
        setStatus("No se pudo enviar el mensaje. Se abrirá tu correo como alternativa.", "error");
        trackLead("email_form_error");
        window.location.href = mailtoUrl({ name, email, subject, message });
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  const headerNumber = document.getElementById("header-wa-number");
  if (headerNumber) {
    headerNumber.textContent = BUSINESS.phoneNumber;
  }

  if (hoursStatus) {
    const statusText = getHoursStatus();
    hoursStatus.textContent = statusText;
    hoursStatus.classList.toggle("open", statusText === "Abierto ahora");
    hoursStatus.classList.toggle("closed", statusText !== "Abierto ahora");
  }

  const address = document.getElementById("address-text");
  if (address) {
    address.textContent = BUSINESS.address;
  }

  document.querySelectorAll("[data-message]").forEach((card) => {
    card.addEventListener("click", () => {
      trackLead("whatsapp_category");
      window.open(whatsappUrl(card.dataset.message), "_blank", "noopener");
    });
  });

  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const catalogResults = document.getElementById("catalog-results");
  const catalogTitle = document.getElementById("catalog-results-title");
  const catalogStatus = document.getElementById("catalog-status");
  const catalogList = document.getElementById("catalog-list");
  const catalogClose = document.getElementById("catalog-results-close");
  const configuredCatalogUrl = window.AidarCatalog && window.AidarCatalog.getCatalogApiBaseUrl(window.AIDAR_PUBLIC_CONFIG);
  const catalogClient = configuredCatalogUrl
    ? new window.AidarCatalog.PublicCatalogClient({ baseUrl: configuredCatalogUrl })
    : null;

  const showCatalog = () => {
    if (catalogResults) catalogResults.hidden = false;
  };

  const clearCatalog = () => {
    if (catalogList) catalogList.replaceChildren();
  };

  const showWhatsAppFallback = (query, message) => {
    if (!catalogList) return;

    const fallback = document.createElement("div");
    fallback.className = "catalog-fallback";

    const copy = document.createElement("p");
    copy.textContent = `${message} Podés consultarnos directamente por WhatsApp.`;

    const whatsapp = document.createElement("a");
    whatsapp.className = "btn btn-whatsapp";
    whatsapp.href = whatsappUrl(searchWhatsAppMessage(query));
    whatsapp.target = "_blank";
    whatsapp.rel = "noopener";
    whatsapp.textContent = "Consultar por WhatsApp";
    whatsapp.addEventListener("click", () => {
      trackCatalogEvent("catalog_whatsapp_click", { query, fallback: true });
      trackLead("whatsapp_catalog_fallback");
    });

    fallback.append(copy, whatsapp);
    catalogList.append(fallback);
  };

  const fallbackToWhatsApp = (query, message, eventName) => {
    showCatalog();
    clearCatalog();
    if (catalogTitle) catalogTitle.textContent = "Consultanos por WhatsApp";
    setCatalogStatus(catalogStatus, message, "error");
    showWhatsAppFallback(query, message);
    if (eventName) trackCatalogEvent(eventName, { query });

    // This preserves the original search fallback. The visible CTA remains available
    // if a browser blocks a popup after the asynchronous catalog request.
    window.open(whatsappUrl(searchWhatsAppMessage(query)), "_blank", "noopener");
  };

  if (catalogClose) {
    catalogClose.addEventListener("click", () => {
      if (catalogResults) catalogResults.hidden = true;
    });
  }

  if (form && input) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const query = input.value.trim();
      if (!query) return;

      trackCatalogEvent("catalog_search", { query });

      if (!catalogClient) {
        fallbackToWhatsApp(query, "El catálogo todavía no está disponible en este entorno.");
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      form.setAttribute("aria-busy", "true");
      showCatalog();
      clearCatalog();
      if (catalogTitle) catalogTitle.textContent = `Resultados para “${query}”`;
      setCatalogStatus(catalogStatus, "Buscando productos publicados…");

      try {
        const products = await catalogClient.search({ query, page: 1, size: 12 });

        if (!products.length) {
          fallbackToWhatsApp(query, "No encontramos productos publicados para esa búsqueda.", "catalog_search_no_results");
          return;
        }

        setCatalogStatus(catalogStatus, `${products.length} producto${products.length === 1 ? "" : "s"} publicado${products.length === 1 ? "" : "s"}.`);
        products.forEach((product) => {
          catalogList.append(catalogProductCard(product, query));
          trackCatalogEvent("catalog_product_view", {
            product_slug: product.slug,
            query,
            source: "catalog_search_results"
          });
        });
      } catch (error) {
        console.error("catalog_search_error", error);
        fallbackToWhatsApp(query, "No pudimos consultar el catálogo en este momento.", "catalog_search_error");
      } finally {
        if (submitButton) submitButton.disabled = false;
        form.removeAttribute("aria-busy");
      }
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
