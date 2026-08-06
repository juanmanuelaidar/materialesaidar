const BUSINESS = {
  whatsappNumber: "5492614536576",
  phoneNumber: "+54 9 261 453 6576",
  email: "materialesaidar@gmail.com",
  mapsUrl: "https://www.google.com/maps/place/AIDAR+Materiales+de+Construcci%C3%B3n/@-32.9897653,-68.7983173,3635m/data=!3m1!1e3!4m6!3m5!1s0x967e0c9580f2975d:0x5a2c11376029d9f6!8m2!3d-32.9796379!4d-68.7901994!16s%2Fg%2F11b7j3j239?entry=ttu&g_ep=EgoyMDI2MDgwMi4wIKXMDSoASAFQAw%3D%3D",
  address: "Angel Godoy 70 Maipú, Mendoza",
  defaultMessage: "Hola, quisiera consultar precio y disponibilidad de materiales."
};

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

document.addEventListener("DOMContentLoaded", () => {
  const wa = whatsappUrl();
  const cleanPhone = BUSINESS.phoneNumber.replace(/[^\d+]/g, "");

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
    "location-maps"
  ].forEach((id) => {
    setLink(id, BUSINESS.mapsUrl, true);

    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => trackLead("maps"));
    }
  });

  setLink("top-phone", `tel:${cleanPhone}`);
  setLink("location-phone", `tel:${cleanPhone}`);
  setLink(
    "top-email",
    `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(BUSINESS.email)}`,
    true
  );

  const headerNumber = document.getElementById("header-wa-number");
  if (headerNumber) {
    headerNumber.textContent = BUSINESS.phoneNumber;
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

  if (form && input) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const query = input.value.trim();
      if (!query) return;

      trackLead("search_to_whatsapp");
      window.open(
        whatsappUrl(`Hola, quisiera consultar por: ${query}`),
        "_blank",
        "noopener"
      );
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
