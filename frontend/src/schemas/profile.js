export const currencies = {
  EUR: "Euro",
  USD: "Dólar estadounidense",
  GBP: "Libra esterlina",
  JPY: "Yen japonés",
  MXN: "Peso mexicano"
};

export function validateProfile(profile, existingUsers = []) {
  if (!profile.name) return "El nombre es obligatorio.";
  if (!profile.firstSurname) return "El primer apellido es obligatorio.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) return "Correo inválido.";
  if (existingUsers.some((user) => user.email === profile.email && user.id !== profile.id)) return "Ese correo ya está en uso.";
  if (!/^[A-Z0-9]{6,12}$/i.test(profile.documentId)) return "DNI o pasaporte inválido.";
  if (!/^\+?[0-9 ]{7,16}$/.test(profile.phone)) return "Número de teléfono inválido.";
  if (!currencies[profile.currency]) return "Moneda invalida.";
  if (profile.password && (profile.password.length < 8 || !/[a-z]/.test(profile.password) || !/[A-Z]/.test(profile.password) || !/\d/.test(profile.password))) return "La nueva contraseña necesita 8 caracteres, mayúscula, minúscula y número.";
  return "";
}

export function isProfileComplete(profile) {
  return Boolean(
    profile?.name &&
    profile?.firstSurname &&
    profile?.documentId &&
    profile?.currency &&
    profile?.email &&
    profile?.phone
  );
}
