import { currentUser, saveSession, saveUsers, sessionToken, startSession, users } from "../app/storage.js";
import { apiBaseUrl, backendUnavailableMessage } from "../app/config.js";
import { validateProfile } from "../schemas/profile.js";

const profileEndpoint = `${apiBaseUrl}/auth/me/profile`;

export async function saveProfile(profile) {
  const user = currentUser();
  if (!user) return "No hay usuario activo.";

  const nextProfile = { ...user, ...profile, email: profile.email.toLowerCase() };
  const error = validateProfile(nextProfile, users());
  if (error) return error;

  const apiError = await saveProfileInBackend(nextProfile);
  if (apiError) return apiError;

  const { password, ...publicProfile } = nextProfile;
  saveUsers(users().map((item) => (item.email === user.email ? publicProfile : item)));
  startSession(nextProfile.email);
  return "";
}

async function saveProfileInBackend(profile) {
  const token = sessionToken();
  if (!token) return "";
  try {
    const response = await fetch(profileEndpoint, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(profile)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return normalizeProfileError(payload.error);
    saveSession(payload);
    return "";
  } catch {
    return backendUnavailableMessage;
  }
}

function normalizeProfileError(error) {
  const messages = {
    "email already registered": "Ese email ya está registrado.",
    "email is invalid": "Correo inválido.",
    "invalid token": "Sesión caducada. Vuelve a entrar.",
    "password must have 6 characters": "La nueva contraseña necesita al menos 6 caracteres."
  };
  return messages[error] || error || "No se pudo guardar el perfil.";
}
