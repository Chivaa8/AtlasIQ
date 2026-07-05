export const labels = {
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

export function validateUser(user) {
  if (!user.name) return "El nombre es obligatorio.";
  if (!user.email.includes("@")) return "Email invalido.";
  if (user.password.length < 6) return "La contrasena necesita al menos 6 caracteres.";
  if (!labels[user.origin]) return "Origen invalido.";
  return "";
}
