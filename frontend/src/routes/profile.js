import { $ } from "../app/dom.js";
import { currentUser, endSession } from "../app/storage.js";
import { showPage } from "../app/pages.js";
import { currencies } from "../schemas/profile.js";
import { labels } from "../schemas/user.js";
import { saveProfile } from "../services/profile.js";
import { deleteAccount, exportAccount } from "../services/account-api.js";
import { showApp } from "./auth.js";
import { renderRecommendations } from "./advisor.js";
import { renderTrips } from "./trips.js";
import { confirmAction, notify, withLoading } from "../app/ui.js";

export function mountProfileRoute() {
  $("#profileForm").addEventListener("submit", submitProfile);
  $("#profilePhoto").addEventListener("change", previewPhoto);
  $("#personalDocumentFile").addEventListener("change", addPersonalDocument);
  $("#personalDocumentList").addEventListener("click", removePersonalDocument);
  $("#exportAccountBtn").addEventListener("click", downloadAccount);
  $("#deleteAccountBtn").addEventListener("click", removeAccount);
}

async function downloadAccount(event) {
  const data = await withLoading(event.currentTarget, "Preparando...", exportAccount);
  if (data.error) return showProfileMessage(data.error);
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `atlasiq-datos-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  notify("Copia de datos descargada.");
}

async function removeAccount(event) {
  if (!confirmAction("¿Eliminar definitivamente tu cuenta, viajes, pagos, reseñas y documentos?")) return;
  if (window.prompt('Escribe ELIMINAR para confirmar') !== "ELIMINAR") return notify("Eliminación cancelada.", "error");
  const result = await withLoading(event.currentTarget, "Eliminando...", deleteAccount);
  if (result.error) return showProfileMessage(result.error);
  endSession();
  showApp();
  notify("Cuenta eliminada.");
}

export function renderProfile() {
  const user = currentUser();
  if (!user) return;
  $("#profileAvatar").src = user.photo || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23edf4f1'/%3E%3Ccircle cx='80' cy='62' r='30' fill='%230c7168'/%3E%3Cpath d='M32 142c8-30 28-46 48-46s40 16 48 46' fill='%230c7168'/%3E%3C/svg%3E";
  $("#profileName").textContent = `${user.name} ${user.firstSurname || ""}`.trim();
  $("#profileMeta").textContent = `${user.email} - ${currencies[user.currency || "EUR"]}`;
  const fields = $("#profileForm").elements;
  fields.name.value = user.name || "";
  fields.firstSurname.value = user.firstSurname || "";
  fields.secondSurname.value = user.secondSurname || "";
  fields.documentId.value = user.documentId || "";
  fields.currency.value = user.currency || "EUR";
  fields.email.value = user.email || "";
  fields.phone.value = user.phone || "";
  fields.password.value = "";
  $("#profilePhotoValue").value = user.photo || "";
  renderPersonalDocuments(user.personalDocuments || []);
  showProfileMessage("");
}

async function submitProfile(event) {
  event.preventDefault();
  const button = event.submitter;
  const data = new FormData(event.currentTarget);
  const error = await withLoading(button, "Guardando...", () => saveProfile(profilePayload({
    id: currentUser().id,
    name: data.get("name").trim(),
    firstSurname: data.get("firstSurname").trim(),
    secondSurname: data.get("secondSurname").trim(),
    documentId: data.get("documentId").trim(),
    currency: data.get("currency"),
    email: data.get("email").trim(),
    phone: data.get("phone").trim(),
    password: data.get("password"),
    photo: data.get("photo")
  })));
  if (error) return showProfileMessage(error);
  const user = currentUser();
  $("#userSummary").textContent = `${user.name} - origen: ${labels[user.origin]}`;
  $("#accountName").textContent = user.name || "Mi cuenta";
  $("#accountEmail").textContent = user.email || "";
  $("#accountAvatar").src = user.photo || $("#profileAvatar").src;
  renderProfile();
  $("#appView").classList.remove("onboarding");
  renderTrips();
  renderRecommendations();
  showPage("homeDashboard");
  notify("Perfil guardado.");
}

function previewPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 1024 * 1024) return showProfileMessage("La foto debe pesar menos de 1 MB.");
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    $("#profileAvatar").src = reader.result;
    $("#profilePhotoValue").value = reader.result;
  });
  reader.readAsDataURL(file);
}

async function addPersonalDocument(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;
  if (file.size > 1024 * 1024) return showProfileMessage("El documento debe pesar menos de 1 MB.");
  const dataUrl = await readFile(file);
  const user = currentUser();
  const personalDocuments = [
    ...(user.personalDocuments || []),
    { id: crypto.randomUUID(), name: file.name, type: file.type || "Documento", size: file.size, dataUrl }
  ];
  const error = await saveProfile(profilePayload({ personalDocuments }));
  if (error) return showProfileMessage(error);
  renderProfile();
  showProfileMessage("Documento guardado.");
}

async function removePersonalDocument(event) {
  const button = event.target.closest("[data-remove-document]");
  if (!button) return;
  if (!confirmAction("¿Eliminar este documento personal? Esta acción no se puede deshacer.")) return;
  const personalDocuments = (currentUser().personalDocuments || []).filter((document) => document.id !== button.dataset.removeDocument);
  const error = await saveProfile(profilePayload({ personalDocuments }));
  if (error) return showProfileMessage(error);
  renderProfile();
  showProfileMessage("Documento eliminado.");
  notify("Documento eliminado.");
}

function renderPersonalDocuments(documents) {
  $("#personalDocumentList").innerHTML = documents.length
    ? documents.map(personalDocumentTemplate).join("")
    : "<p class=\"muted\">Aún no has subido documentos personales.</p>";
}

function personalDocumentTemplate(document) {
  return `
    <article class="personal-document">
      <div>
        <strong>${document.name}</strong>
        <span>${document.type} - ${formatSize(document.size)}</span>
      </div>
      <a class="link-button" href="${document.dataUrl}" download="${document.name}">Descargar</a>
      <button class="link-button" type="button" data-remove-document="${document.id}">Eliminar</button>
    </article>
  `;
}

function profilePayload(overrides = {}) {
  const user = currentUser();
  return {
    ...user,
    ...overrides,
    personalDocuments: overrides.personalDocuments || user.personalDocuments || []
  };
}

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes = 0) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function showProfileMessage(text) {
  $("#profileMessage").textContent = text;
}
