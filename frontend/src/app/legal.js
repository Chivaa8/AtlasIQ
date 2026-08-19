const texts = {
  privacy: ["Política de privacidad", "AtlasIQ trata los datos de cuenta y viaje para prestar el servicio. No vende datos personales. Puedes solicitar acceso, rectificación y eliminación. Los proveedores de pagos reciben únicamente los datos necesarios para procesar cada operación."],
  cookies: ["Política de cookies", "AtlasIQ utiliza almacenamiento local imprescindible para la sesión y tus preferencias. La analítica opcional solo se activa con consentimiento y puede rechazarse sin perder funciones."],
  terms: ["Condiciones de uso", "AtlasIQ ayuda a planificar viajes y enlaza proveedores externos. Precios y disponibilidad deben confirmarse antes de reservar. Cada proveedor aplica sus condiciones de cancelación, seguro y responsabilidad."]
};

export function mountLegal() {
  const banner = document.querySelector("#cookieBanner");
  banner.classList.toggle("hidden", Boolean(localStorage.getItem("atlasiq-cookie-consent")));
  document.addEventListener("click", (event) => {
    const legal = event.target.closest("[data-legal]");
    if (legal) {
      const [title, body] = texts[legal.dataset.legal];
      document.querySelector("#legalContent").innerHTML = `<h2>${title}</h2><p>${body}</p><p>Contacto: privacidad@atlasiq.example</p>`;
      document.querySelector("#legalDialog").showModal();
    }
    const choice = event.target.closest("[data-cookie-choice]");
    if (choice) { localStorage.setItem("atlasiq-cookie-consent", choice.dataset.cookieChoice); banner.classList.add("hidden"); }
    const close = event.target.closest("[data-close-dialog]");
    if (close) close.closest("dialog").close();
  });
}
