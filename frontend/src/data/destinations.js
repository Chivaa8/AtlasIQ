export const destinations = [
  { name: "Portugal", city: "Lisboa, Porto y Algarve", continent: "europe", landscape: ["beach"], environment: ["city", "countryside"], vibe: ["culture", "party"], minDays: 4, dailyCost: 105, highlights: ["costa", "vino", "azulejos", "vida nocturna"] },
  { name: "Marruecos", city: "Marrakech, Atlas y Essaouira", continent: "africa", landscape: ["mountain", "beach"], environment: ["city", "countryside"], vibe: ["culture"], minDays: 5, dailyCost: 80, highlights: ["zocos", "desierto", "riad", "montanas"] },
  { name: "Grecia", city: "Atenas, Milos y Creta", continent: "europe", landscape: ["beach"], environment: ["city", "countryside"], vibe: ["culture", "party"], minDays: 6, dailyCost: 125, highlights: ["islas", "historia", "tabernas", "atardeceres"] },
  { name: "Islandia", city: "Ring Road", continent: "europe", landscape: ["mountain"], environment: ["countryside"], vibe: ["culture"], minDays: 7, dailyCost: 210, highlights: ["glaciares", "cascadas", "auroras", "road trip"] },
  { name: "Mexico", city: "CDMX, Oaxaca y Riviera Maya", continent: "america", landscape: ["beach", "mountain"], environment: ["city"], vibe: ["culture", "party"], minDays: 8, dailyCost: 115, highlights: ["ruinas", "tacos", "museos", "caribe"] },
  { name: "Costa Rica", city: "La Fortuna, Monteverde y Manuel Antonio", continent: "america", landscape: ["beach", "mountain"], environment: ["countryside"], vibe: ["culture"], minDays: 8, dailyCost: 135, highlights: ["selva", "volcanes", "playas", "fauna"] },
  { name: "Japon", city: "Tokyo, Kyoto y Osaka", continent: "asia", landscape: ["mountain"], environment: ["city"], vibe: ["culture", "party"], minDays: 10, dailyCost: 155, highlights: ["templos", "gastronomia", "trenes", "barrios neon"] },
  { name: "Indonesia", city: "Bali y Lombok", continent: "asia", landscape: ["beach", "mountain"], environment: ["countryside"], vibe: ["culture", "party"], minDays: 10, dailyCost: 95, highlights: ["playas", "arrozales", "volcanes", "beach clubs"] },
  { name: "Nueva Zelanda", city: "Isla Sur", continent: "oceania", landscape: ["mountain", "beach"], environment: ["countryside"], vibe: ["culture"], minDays: 14, dailyCost: 185, highlights: ["senderismo", "lagos", "fiordos", "van trip"] }
];

export const proximity = {
  europe: { europe: 24, africa: 16, asia: 8, america: 4, oceania: 0 },
  "north-africa": { africa: 24, europe: 18, asia: 8, america: 3, oceania: 0 },
  "north-america": { america: 24, europe: 10, asia: 8, africa: 5, oceania: 4 },
  "latin-america": { america: 24, europe: 8, africa: 6, asia: 4, oceania: 2 },
  asia: { asia: 24, oceania: 12, europe: 8, africa: 4, america: 2 },
  oceania: { oceania: 24, asia: 16, america: 7, europe: 4, africa: 2 }
};
