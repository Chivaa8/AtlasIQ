import { currentUser, saveUsers, startSession, users } from "../app/storage.js";
import { validateProfile } from "../schemas/profile.js";

export function saveProfile(profile) {
  const user = currentUser();
  if (!user) return "No hay usuario activo.";

  const nextProfile = { ...user, ...profile, email: profile.email.toLowerCase() };
  const error = validateProfile(nextProfile, users());
  if (error) return error;

  saveUsers(users().map((item) => (item.email === user.email ? nextProfile : item)));
  startSession(nextProfile.email);
  return "";
}
