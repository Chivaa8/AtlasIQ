const userKey = "atlasiq-users";
const sessionKey = "atlasiq-session";
const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const labels = {
  asia: "Asia",
  europe: "Europa",
  america: "America",
  africa: "Africa",
  oceania: "Oceania",
  beach: "Playa",
  mountain: "Montana",
  city: "Ciudad",
  countryside: "Campo",
  culture: "Cultura",
  party: "Fiesta",
  "north-africa": "Norte de Africa",
  "north-america": "Norteamerica",
  "latin-america": "Latinoamerica"
};

const authView = document.querySelector("#authView");
const appView = document.querySelector("#appView");
const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const tripForm = document.querySelector("#tripForm");

function users() {
  return JSON.parse(localStorage.getItem(userKey) || "[]");
}

function saveUsers(nextUsers) {
  localStorage.setItem(userKey, JSON.stringify(nextUsers));
}

function currentUser() {
  const email = localStorage.getItem(sessionKey);
  return users().find((user) => user.email === email);
}

function showMessage(text) {
  document.querySelector("#authMessage").textContent = text;
}

function showAuthMode(mode) {
  const isLogin = mode === "login";
  loginForm.classList.toggle("hidden", !isLogin);
  registerForm.classList.toggle("hidden", isLogin);
  document.querySelector("#loginTab").classList.toggle("active", isLogin);
  document.querySelector("#registerTab").classList.toggle("active", !isLogin);
  showMessage("");
}

function showApp() {
  const user = currentUser();
  authView.classList.toggle("hidden", Boolean(user));
  appView.classList.toggle("hidden", !user);
  if (!user) return;
  document.querySelector("#userSummary").textContent = `${user.name} · origen: ${labels[user.origin]}`;
  renderRecommendations();
}

function getPreferences() {
  const data = new FormData(tripForm);
  return {
    goal: data.get("goal").trim(),
    continent: data.get("continent"),
    landscape: data.get("landscape"),
    environment: data.get("environment"),
    vibe: data.get("vibe"),
    days: Number(data.get("days")),
    budget: Number(data.get("budget")),
    origin: currentUser().origin
  };
}

function renderRecommendations() {
  const preferences = getPreferences();
  const results = AtlasIQ.recommendDestinations(preferences);

  document.querySelector("#matchMetric").textContent = `${results.length} matches`;
  document.querySelector("#summary").textContent = results.length
    ? `Opciones desde ${labels[preferences.origin]} para ${preferences.days} dias`
    : "No hay destino claro con esos filtros";
  document.querySelector("#results").innerHTML = results.length ? results.map(cardTemplate).join("") : emptyTemplate();
}

function cardTemplate(destination) {
  return `
    <article class="destination-card">
      <div class="destination-top">
        <div>
          <span>${labels[destination.continent]}</span>
          <h3>${destination.name}</h3>
          <p>${destination.city}</p>
        </div>
        <strong>${destination.score}/100</strong>
      </div>
      <dl>
        <div><dt>Coste estimado</dt><dd>${euro.format(destination.estimatedCost)}</dd></div>
        <div><dt>Cercania</dt><dd>${destination.proximity}</dd></div>
      </dl>
      <div class="tags">
        ${destination.landscape.map((tag) => `<span>${labels[tag]}</span>`).join("")}
        ${destination.environment.map((tag) => `<span>${labels[tag]}</span>`).join("")}
        ${destination.vibe.map((tag) => `<span>${labels[tag]}</span>`).join("")}
      </div>
      <p class="highlights">${destination.highlights.join(" · ")}</p>
    </article>
  `;
}

function emptyTemplate() {
  return `
    <article class="empty">
      <h3>Prueba a subir presupuesto o abrir continente.</h3>
      <p>AtlasIQ esta priorizando opciones realistas segun tu origen y dias.</p>
    </article>
  `;
}

document.querySelector("#loginTab").addEventListener("click", () => showAuthMode("login"));
document.querySelector("#registerTab").addEventListener("click", () => showAuthMode("register"));

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(registerForm);
  const nextUser = {
    name: data.get("name").trim(),
    email: data.get("email").trim().toLowerCase(),
    password: data.get("password"),
    origin: data.get("origin")
  };
  if (users().some((user) => user.email === nextUser.email)) {
    showMessage("Ese email ya esta registrado.");
    return;
  }
  saveUsers([...users(), nextUser]);
  localStorage.setItem(sessionKey, nextUser.email);
  showApp();
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = data.get("email").trim().toLowerCase();
  const user = users().find((item) => item.email === email && item.password === data.get("password"));
  if (!user) {
    showMessage("Email o contrasena incorrectos.");
    return;
  }
  localStorage.setItem(sessionKey, user.email);
  showApp();
});

document.querySelector("#forgotBtn").addEventListener("click", () => {
  const email = new FormData(loginForm).get("email").trim().toLowerCase();
  const user = users().find((item) => item.email === email);
  showMessage(user ? `Demo: tu contrasena guardada es "${user.password}".` : "Escribe un email registrado para recuperar la contrasena.");
});

document.querySelector("#logoutBtn").addEventListener("click", () => {
  localStorage.removeItem(sessionKey);
  showApp();
});

tripForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderRecommendations();
});

tripForm.addEventListener("input", renderRecommendations);

showApp();
