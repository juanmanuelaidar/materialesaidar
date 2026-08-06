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

function mailtoUrl({ name, email, subject, message }) {
  const body = [
    `Nombre: ${name}`,
    `Email: ${email}`,
    "",
    message
  ].join("\n");

  return `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function setModalOpen(modal, isOpen) {
  if (!modal) return;
  modal.classList.toggle("is-open", isOpen);
  modal.setAttribute("aria-hidden", isOpen ? "false" : "true");
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
    [[8 * 60, 12 * 60], [15 * 60, 19 * 60]],
    [[8 * 60, 12 * 60], [15 * 60, 19 * 60]],
    [[8 * 60, 12 * 60], [15 * 60, 19 * 60]],
    [[8 * 60, 12 * 60], [15 * 60, 19 * 60]],
    [[8 * 60, 12 * 60], [15 * 60, 19 * 60]],
    [[8 * 60, 12 * 60]]
  ];

  const ranges = weekdayRanges[day] || [];
  const open = ranges.some(([start, end]) => minutes >= start && minutes < end);

  return open ? "Abierto ahora" : "Cerrado ahora";
}

document.addEventListener("DOMContentLoaded", () => {
  const wa = whatsappUrl();
  const cleanPhone = BUSINESS.phoneNumber.replace(/[^\d+]/g, "");
  const emailTrigger = document.getElementById("top-email");
  const emailModal = document.getElementById("email-modal");
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

  if (emailTrigger && emailModal) {
    emailTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      setModalOpen(emailModal, true);
      trackLead("email_form_open");
      const firstInput = emailModal.querySelector('input[name="name"]');
      if (firstInput) firstInput.focus();
    });
  }

  if (emailModal) {
    emailModal.querySelectorAll("[data-email-close]").forEach((el) => {
      el.addEventListener("click", () => setModalOpen(emailModal, false));
    });

    emailModal.addEventListener("click", (event) => {
      if (event.target === emailModal) {
        setModalOpen(emailModal, false);
      }
    });
  }

  if (emailForm) {
    emailForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(emailForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const subject = String(formData.get("subject") || "").trim();
      const message = String(formData.get("message") || "").trim();

      if (!name || !email || !subject || !message) return;

      window.location.href = mailtoUrl({ name, email, subject, message });
      setModalOpen(emailModal, false);
      emailForm.reset();
      trackLead("email_form_submit");
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
