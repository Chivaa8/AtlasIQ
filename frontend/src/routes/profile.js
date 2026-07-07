import { $ } from "../app/dom.js";
import { currentUser } from "../app/storage.js";
import { currencies } from "../schemas/profile.js";
import { labels } from "../schemas/user.js";
import { saveProfile } from "../services/profile.js";
import { renderRecommendations } from "./advisor.js";
import { renderTrips } from "./trips.js";

export function mountProfileRoute() {
  $("#profileForm").addEventListener("submit", submitProfile);
  $("#profilePhoto").addEventListener("change", previewPhoto);
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
  showProfileMessage("");
}

function submitProfile(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const error = saveProfile({
    id: currentUser().id,
    name: data.get("name").trim(),
    firstSurname: data.get("firstSurname").trim(),
    secondSurname: data.get("secondSurname").trim(),
    documentId: data.get("documentId").trim(),
    currency: data.get("currency"),
    email: data.get("email").trim(),
    phone: data.get("phone").trim(),
    password: data.get("password") || currentUser().password,
    photo: data.get("photo")
  });
  if (error) return showProfileMessage(error);
  const user = currentUser();
  $("#userSummary").textContent = `${user.name} - origen: ${labels[user.origin]}`;
  renderProfile();
  document.querySelector(".profile-panel").classList.add("hidden");
  $("#advisor").classList.remove("hidden");
  $("#appView").classList.remove("onboarding");
  renderTrips();
  renderRecommendations();
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

function showProfileMessage(text) {
  $("#profileMessage").textContent = text;
}
