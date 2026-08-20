export function notify(text, type = "success") {
  const region = document.querySelector("#toastRegion");
  if (!region || !text) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.textContent = text;
  region.append(toast);
  setTimeout(() => toast.remove(), 4500);
}

export async function withLoading(button, label, action) {
  if (!button || button.disabled) return;
  const previous = button.textContent;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.textContent = label;
  try {
    return await action();
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.textContent = previous;
  }
}

export function confirmAction(message) {
  return window.confirm(message);
}

export function emptyState(title, text, target = "") {
  return `<article class="empty-state"><h3>${title}</h3><p>${text}</p>${target ? `<button type="button" data-page-target="${target}">Continuar</button>` : ""}</article>`;
}

export function skeleton(count = 3) {
  return Array.from({ length: count }, () => '<div class="skeleton" aria-hidden="true"></div>').join("");
}

export function mountUi() {
  const nativeFetch = window.fetch.bind(window);
  let pending = 0;
  window.fetch = async (...args) => {
    document.body.classList.toggle("network-busy", ++pending > 0);
    try {
      return await nativeFetch(...args);
    } finally {
      document.body.classList.toggle("network-busy", --pending > 0);
    }
  };

  const updateConnection = (reconnected = false) => {
    const offline = !navigator.onLine;
    document.querySelector("#offlineBanner").classList.toggle("hidden", !offline);
    if (!offline && reconnected) notify("Conexión recuperada.");
  };
  window.addEventListener("online", () => updateConnection(true));
  window.addEventListener("offline", () => updateConnection());
  updateConnection();

  const toggle = document.querySelector("#navToggle");
  const nav = document.querySelector("#mainNav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });

  window.addEventListener("unhandledrejection", () => notify("No se pudo completar la operación.", "error"));

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
}
