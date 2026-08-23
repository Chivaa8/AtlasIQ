import { currentUser } from "../app/storage.js";
import { adminUsers, removeReview, setUserBlocked } from "../services/admin-api.js";
import { reviews } from "../services/user-data-api.js";
import { confirmAction, notify } from "../app/ui.js";

export function mountAdminRoute() {
  document.addEventListener("click", (event) => {
    if (event.target.closest('[data-page-target="adminPanel"]')) renderAdmin();
  });
  document.querySelector("#adminPanel").addEventListener("click", handleAction);
}

async function renderAdmin() {
  if (currentUser()?.role !== "admin") return;
  const [users, reviewList] = await Promise.all([adminUsers(), reviews()]);
  if (users.error || reviewList.error) return showError(users.error || reviewList.error);
  document.querySelector("#adminSummary").textContent = `${users.length} usuarios · ${reviewList.length} reseñas`;
  document.querySelector("#adminUsers").innerHTML = users.map((user) => `<div class="admin-row"><span><strong>${escape(user.name)}</strong><small>${escape(user.email)} · ${user.role}</small></span>${user.role === "admin" ? "<strong>Administrador</strong>" : `<button type="button" data-block-user="${user.id}" data-blocked="${Boolean(user.blocked)}">${user.blocked ? "Desbloquear" : "Bloquear"}</button>`}</div>`).join("");
  document.querySelector("#adminReviews").innerHTML = reviewList.length ? reviewList.map((review) => `<div class="admin-row"><span><strong>${escape(review.name)}</strong><small>${escape(review.destination)} · ${escape(review.text)}</small></span><button class="link-button" type="button" data-remove-review="${review.id}">Eliminar</button></div>`).join("") : "<p>No hay reseñas.</p>";
}

async function handleAction(event) {
  const userButton = event.target.closest("[data-block-user]");
  const reviewButton = event.target.closest("[data-remove-review]");
  if (userButton) {
    const blocked = userButton.dataset.blocked !== "true";
    if (!confirmAction(`¿${blocked ? "Bloquear" : "Desbloquear"} este usuario?`)) return;
    const result = await setUserBlocked(userButton.dataset.blockUser, blocked);
    if (result.error) return showError(result.error);
    notify(blocked ? "Usuario bloqueado." : "Usuario desbloqueado.");
  }
  if (reviewButton) {
    if (!confirmAction("¿Eliminar esta reseña?")) return;
    const result = await removeReview(reviewButton.dataset.removeReview);
    if (result.error) return showError(result.error);
    notify("Reseña eliminada.");
  }
  renderAdmin();
}

function showError(message) { document.querySelector("#adminMessage").textContent = message; notify(message, "error"); }
function escape(value) { const node = document.createElement("span"); node.textContent = String(value || ""); return node.innerHTML; }
