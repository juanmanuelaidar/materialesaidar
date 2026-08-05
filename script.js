/*
  CONFIGURACIÓN RÁPIDA
  Reemplazá solamente estos valores y la landing queda funcional.
*/

const BUSINESS = {
  // IMPORTANTE: solo números.
  // Ejemplo Argentina: 5492611234567
  whatsappNumber: "549XXXXXXXXXX",

  // Teléfono para el botón "Llamar"
  phoneNumber: "+54 9 261 XXX XXXX",

  // Link completo de Google Maps de tu ficha comercial
  mapsUrl: "https://maps.google.com/",

  // Dirección visible
  address: "REEMPLAZAR POR LA DIRECCIÓN DEL LOCAL",

  // Mensaje inicial de WhatsApp
  defaultMessage:
    "Hola, quisiera consultar precio y disponibilidad de materiales."
};


/* ========================================
   FUNCIONES AUXILIARES
======================================== */

function cleanWhatsappNumber(number) {
  return String(number).replace(/\D/g, "");
}


function whatsappUrl(message = BUSINESS.defaultMessage) {
  const number = cleanWhatsappNumber(BUSINESS.whatsappNumber);

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}


function setHref(id, href, newTab = false) {
  const el = document.getElementById(id);

  if (!el) return;

  el.href = href;

  if (newTab) {
    el.target = "_blank";
    el.rel = "noopener";
  }
}


/* ========================================
   SEGUIMIENTO DE CONVERSIONES
======================================== */

function trackLead(action) {

  /*
    Dejamos preparado el punto de medición.

    Cuando conectemos Google Ads o Google Analytics,
    acá podemos agregar los eventos de conversión.
  */

  console.log("lead_click", action);


  /*
    Si Google Analytics / Google Ads está instalado,
    dispara un evento automáticamente.
  */

  if (typeof window.gtag === "function") {

    window.gtag("event", "generate_lead", {
      lead_source: action
    });

  }

}


/* ========================================
   CUANDO CARGA LA PÁGINA
======================================== */

document.addEventListener("DOMContentLoaded", () => {

  const defaultWa = whatsappUrl();


  /* ========================================
     BOTONES GENERALES DE WHATSAPP
  ======================================== */

  const whatsappButtons = [
    "header-whatsapp",
    "hero-whatsapp",
    "footer-whatsapp",
    "floating-whatsapp"
  ];


  whatsappButtons.forEach((id) => {

    setHref(id, defaultWa, true);

    const el = document.getElementById(id);

    if (el) {

      el.addEventListener("click", () => {
        trackLead("whatsapp");
      });

    }

  });


  /* ========================================
     BOTONES GOOGLE MAPS
  ======================================== */

  const mapsButtons = [
    "hero-maps",
    "location-maps"
  ];


  mapsButtons.forEach((id) => {

    setHref(id, BUSINESS.mapsUrl, true);

    const el = document.getElementById(id);

    if (el) {

      el.addEventListener("click", () => {
        trackLead("maps");
      });

    }

  });


  /* ========================================
     BOTÓN LLAMAR
  ======================================== */

  const phoneLink = document.getElementById("phone-link");


  if (phoneLink) {

    const cleanPhone = BUSINESS.phoneNumber.replace(/[^\d+]/g, "");

    phoneLink.href = `tel:${cleanPhone}`;


    phoneLink.addEventListener("click", () => {
      trackLead("phone");
    });

  }


  /* ========================================
     DIRECCIÓN
  ======================================== */

  const addressText = document.getElementById("address-text");


  if (addressText) {

    addressText.textContent = BUSINESS.address;

  }


  /* ========================================
     CONSULTAS POR PRODUCTO
  ======================================== */

  document.querySelectorAll("[data-message]").forEach((el) => {

    el.addEventListener("click", () => {

      const message = el.dataset.message;

      trackLead("whatsapp_product");


      window.open(
        whatsappUrl(message),
        "_blank",
        "noopener"
      );

    });

  });


  /* ========================================
     AÑO AUTOMÁTICO DEL FOOTER
  ======================================== */

  const year = document.getElementById("year");


  if (year) {

    year.textContent = new Date().getFullYear();

  }

});