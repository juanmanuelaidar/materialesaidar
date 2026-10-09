const BUSINESS = {
  whatsappNumber: "5492614536576",
  phoneNumber: "+54 9 261 453 6576",
  landlineNumber: "+54 261 497 2145",
  email: "materialesaidar@gmail.com",
  mapsUrl: "https://www.google.com/maps/place/AIDAR+Materiales+de+Construcci%C3%B3n/@-32.9897653,-68.7983173,3635m/data=!3m1!1e3!4m6!3m5!1s0x967e0c9580f2975d:0x5a2c11376029d9f6!8m2!3d-32.9796379!4d-68.7901994!16s%2Fg%2F11b7j3j239?entry=ttu&g_ep=EgoyMDI2MDgwMi4wIKXMDSoASAFQAw%3D%3D",
  address: "Angel Godoy 70, Maipú, Mendoza",
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
  const cleanPhone = BUSINESS.landlineNumber.replace(/[^\d+]/g, "");
  const emailForm = document.getElementById("email-form");
  const hoursStatus = document.getElementById("hours-status");

  [
    "header-whatsapp",
    "hero-whatsapp",
    "hero-whatsapp-number",
    "mobile-whatsapp",
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

  ["top-phone", "location-phone", "mobile-phone"].forEach((id) => {
    setLink(id, `tel:${cleanPhone}`);

    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => trackLead("phone"));
    }
  });

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
      const subject = String(formData.get("subject") || "").trim() || `Consulta de ${name}`;
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

  const statusText = getHoursStatus();
  const isOpen = statusText === "Abierto ahora";

  if (hoursStatus) {
    hoursStatus.textContent = statusText;
    hoursStatus.classList.toggle("open", isOpen);
    hoursStatus.classList.toggle("closed", !isOpen);
  }

  const heroStatus = document.getElementById("hero-status");
  if (heroStatus) {
    heroStatus.textContent = `${statusText} · Maipú, Mendoza`;
  }

  document.querySelectorAll("[data-status-dot]").forEach((dot) => {
    dot.classList.toggle("open", isOpen);
    dot.classList.toggle("closed", !isOpen);
  });

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
