const form = document.querySelector("#tripForm");
const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const docsByDestination = {
  japon: "Pasaporte en vigor. Para estancias turisticas cortas, revisar requisitos oficiales antes de comprar vuelos.",
  indonesia: "Pasaporte con validez suficiente, visado segun duracion y posible tasa turistica por zona.",
  default: "Revisar pasaporte, visado, seguro medico y normas de entrada del pais antes del viaje."
};

function render() {
  const data = new FormData(form);
  const trip = {
    destination: data.get("destination").trim(),
    days: Number(data.get("days")),
    budget: Number(data.get("budget")),
    style: data.get("style")
  };
  const plan = AtlasIQ.optimizeTrip(trip);
  const left = trip.budget - plan.total;

  document.querySelector("#costMetric").textContent = euro.format(plan.total);
  document.querySelector("#leftMetric").textContent = euro.format(left);
  document.querySelector("#scoreMetric").textContent = `${plan.averageScore}/100`;
  document.querySelector("#summary").textContent = `${trip.destination}: ${plan.ranked.length} paradas optimizadas para ${trip.style}.`;
  document.querySelector("#itinerary").innerHTML = plan.ranked.map((item, index) => `
    <article class="day">
      <strong>Dia ${index + 1}</strong>
      <div>
        <h3>${item.city}</h3>
        <p>${item.title} · ${euro.format(item.cost)} · ${item.hours} h</p>
      </div>
      <span class="score">${item.score}/100</span>
    </article>
  `).join("");

  const key = trip.destination.toLowerCase();
  document.querySelector("#docsText").textContent = docsByDestination[key] || docsByDestination.default;
  document.querySelector("#currencyText").textContent = "JPY estimado: 1 EUR = 170 JPY. API real en fase NestJS.";
  document.querySelector("#weatherText").textContent = "Ventana sugerida: primavera u otono. Weather API entra cuando haya backend.";
  document.querySelector("#checklist").innerHTML = [
    "Vuelos y hoteles confirmados",
    "Seguro medico",
    "Documentos escaneados",
    "Presupuesto compartido",
    "Actividades reservadas"
  ].map((item) => `<li>${item}</li>`).join("");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});

document.querySelector("#shareBtn").addEventListener("click", async () => {
  const text = document.querySelector("#summary").textContent;
  await navigator.clipboard.writeText(text);
});

render();
