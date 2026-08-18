import { convertCurrency } from "../schemas/trip.js";

const currencies = ["EUR", "USD", "GBP", "JPY", "MXN", "MAD", "ISK", "CRC", "IDR", "NZD"];
const phrases = {
  en: ["Hola|Hello", "Gracias|Thank you", "¿Cuánto cuesta?|How much is it?", "Necesito ayuda|I need help", "¿Dónde está el hospital?|Where is the hospital?"],
  fr: ["Hola|Bonjour", "Gracias|Merci", "¿Cuánto cuesta?|Combien ça coûte ?", "Necesito ayuda|J'ai besoin d'aide", "¿Dónde está el hospital?|Où est l'hôpital ?"],
  it: ["Hola|Ciao", "Gracias|Grazie", "¿Cuánto cuesta?|Quanto costa?", "Necesito ayuda|Ho bisogno di aiuto", "¿Dónde está el hospital?|Dov'è l'ospedale?"],
  pt: ["Hola|Olá", "Gracias|Obrigado/a", "¿Cuánto cuesta?|Quanto custa?", "Necesito ayuda|Preciso de ajuda", "¿Dónde está el hospital?|Onde fica o hospital?"],
  de: ["Hola|Hallo", "Gracias|Danke", "¿Cuánto cuesta?|Wie viel kostet das?", "Necesito ayuda|Ich brauche Hilfe", "¿Dónde está el hospital?|Wo ist das Krankenhaus?"],
  ja: ["Hola|こんにちは (Konnichiwa)", "Gracias|ありがとう (Arigatō)", "¿Cuánto cuesta?|いくらですか? (Ikura desu ka?)", "Necesito ayuda|助けてください (Tasukete kudasai)", "¿Dónde está el hospital?|病院はどこですか?"],
  ar: ["Hola|مرحبا (Marhaban)", "Gracias|شكرا (Shukran)", "¿Cuánto cuesta?|كم السعر؟", "Necesito ayuda|أحتاج مساعدة", "¿Dónde está el hospital?|أين المستشفى؟"]
};

export function mountToolsRoute() {
  const currencyForm = document.querySelector("#globalCurrencyForm");
  currencyForm.addEventListener("input", renderCurrency);
  currencyForm.addEventListener("change", renderCurrency);
  document.querySelector("#guideLanguage").addEventListener("change", renderGuide);
  document.querySelector("#rentalForm").addEventListener("submit", renderRental);
  renderCurrency();
  renderGuide();
}

function renderCurrency() {
  const form = document.querySelector("#globalCurrencyForm");
  const data = new FormData(form);
  const amount = Number(data.get("amount")) || 0;
  const from = data.get("from");
  const to = data.get("to");
  const result = convertCurrency(amount, to, from);
  document.querySelector("#globalCurrencyResult").textContent = `${formatMoney(amount, from)} = ${formatMoney(result, to)}`;
}

function renderGuide() {
  const language = document.querySelector("#guideLanguage").value;
  document.querySelector("#phraseList").innerHTML = phrases[language].map((entry) => {
    const [spanish, translation] = entry.split("|");
    return `<li><span>${spanish}</span><strong>${translation}</strong></li>`;
  }).join("");
}

function renderRental(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const estimate = rentalEstimate(data.get("vehicle"), data.get("days"), data.get("coverage"), data.get("age"));
  document.querySelector("#rentalResult").innerHTML = `
    <strong>${formatMoney(estimate.total, "EUR")}</strong>
    <span>${estimate.days} días · ${estimate.daily.toFixed(0)} €/día</span>
    <p>Estimación orientativa. Compara franquicia, combustible, kilometraje y permiso requerido antes de reservar.</p>
  `;
}

export function rentalEstimate(vehicle, days, coverage, age) {
  const safeDays = Math.max(1, Math.min(60, Number(days) || 1));
  const base = vehicle === "moto" ? 25 : 45;
  const insurance = coverage === "full" ? 15 : 0;
  const youngDriver = Number(age) < 25 ? 12 : 0;
  const daily = base + insurance + youngDriver;
  return { days: safeDays, daily, total: safeDays * daily };
}

export function currencyCodes() {
  return currencies;
}

function formatMoney(value, currency) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency, maximumFractionDigits: currency === "JPY" ? 0 : 2 }).format(value);
}
