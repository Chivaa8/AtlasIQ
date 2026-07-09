const defaultVisa = {
  status: "Revisa requisitos antes de reservar",
  detail: "Comprueba visado, pasaporte, seguro y vacunas en fuentes oficiales según tu nacionalidad.",
  url: "https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Recomendaciones-de-viaje.aspx"
};

const defaultWeather = {
  average: "Variable por temporada",
  rain: "Revisar antes de viajar",
  bestMonths: "Depende de la zona y del tipo de viaje"
};

const drivingByContinent = {
  europe: { side: "Derecha", car: "Carné B válido en la UE; fuera de la UE revisa permiso internacional.", moto: "Permiso A/A2 según cilindrada.", note: "Respeta zonas ambientales, peajes y límites urbanos." },
  asia: { side: "Variable", car: "Suele exigirse permiso internacional junto al carné nacional.", moto: "Moto solo con permiso válido e internacional; cuidado con seguros y cilindrada.", note: "Tráfico denso en grandes ciudades; revisa normas locales antes de alquilar." },
  america: { side: "Derecha", car: "Carné nacional y, según país/estado, permiso internacional.", moto: "Permiso de moto válido; revisa casco, seguro y restricciones locales.", note: "Distancias largas: calcula gasolina, peajes y cobertura." },
  africa: { side: "Variable", car: "Recomendable permiso internacional y seguro completo.", moto: "Permiso de moto válido; no recomendado sin experiencia local.", note: "Comprueba estado de carreteras, conducción nocturna y requisitos policiales." },
  oceania: { side: "Izquierda", car: "Permiso internacional recomendado para alquilar.", moto: "Permiso de moto válido e internacional; casco obligatorio.", note: "Distancias muy largas y normas estrictas de velocidad." }
};

const drivingOverrides = {
  "España": { side: "Derecha", car: "Carné B español o europeo válido.", moto: "Permiso AM/A1/A2/A según moto.", note: "Lleva documentación, seguro y respeta ZBE en grandes ciudades." },
  "Reino Unido": { side: "Izquierda", car: "Carné válido; revisa si necesitas permiso internacional.", moto: "Permiso de moto válido y casco obligatorio.", note: "Conduce por la izquierda y revisa normas de rotondas." },
  "Irlanda": { side: "Izquierda", car: "Carné válido; muchas carreteras rurales son estrechas.", moto: "Permiso de moto válido y casco obligatorio.", note: "Conduce por la izquierda." },
  "Japón": { side: "Izquierda", car: "Permiso internacional según Convenio de Ginebra o traducción oficial si aplica.", moto: "Permiso específico de moto; normas estrictas.", note: "Transporte público excelente; coche útil en zonas rurales." },
  "Tailandia": { side: "Izquierda", car: "Permiso internacional recomendado.", moto: "Permiso internacional de moto; muchas aseguradoras no cubren sin él.", note: "Tráfico intenso; casco siempre." },
  "Indonesia": { side: "Izquierda", car: "Permiso internacional recomendado.", moto: "Permiso internacional de moto muy recomendable; revisa seguro.", note: "Moto popular en Bali, pero exige experiencia." },
  "Australia": { side: "Izquierda", car: "Permiso internacional recomendado; normas muy estrictas.", moto: "Permiso de moto válido e internacional.", note: "No subestimes distancias ni fauna en carretera." },
  "Nueva Zelanda": { side: "Izquierda", car: "Permiso internacional o traducción oficial recomendable.", moto: "Permiso de moto válido.", note: "Carreteras panorámicas, lentas y con clima cambiante." },
  "Sudáfrica": { side: "Izquierda", car: "Permiso internacional recomendado y seguro completo.", moto: "Permiso válido; extrema precaución.", note: "Evita conducción nocturna en rutas desconocidas." }
};

function destination(name, city, continent, landscape, environment, vibe, minDays, dailyCost, currency, highlights, extra = {}) {
  return {
    name,
    country: extra.country || name,
    city,
    continent,
    landscape,
    environment,
    vibe,
    minDays,
    dailyCost,
    currency,
    weather: extra.weather || defaultWeather,
    visa: extra.visa || defaultVisa,
    driving: extra.driving || drivingRules(name, continent),
    highlights
  };
}

function drivingRules(name, continent) {
  return drivingOverrides[name] || drivingByContinent[continent] || drivingByContinent.europe;
}

export const destinations = [
  destination("Francia", "París, Costa Azul y Alsacia", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 4, 145, "EUR", ["museos", "gastronomía", "vino", "castillos"]),
  destination("España", "Barcelona, Madrid y Baleares", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 3, 110, "EUR", ["tapas", "playas", "museos", "fiesta"]),
  destination("Andalucía", "Sevilla, Córdoba, Granada, Málaga y Cádiz", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 4, 95, "EUR", ["tapas", "flamenco", "playas", "pueblos blancos"], { country: "España" }),
  destination("Cataluña", "Barcelona, Costa Brava, Girona y Pirineos", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 4, 120, "EUR", ["modernismo", "calas", "gastronomía", "montaña"], { country: "España" }),
  destination("Comunidad de Madrid", "Madrid, Alcalá, Aranjuez y Sierra de Guadarrama", "europe", ["mountain"], ["city", "countryside"], ["culture", "party"], 3, 115, "EUR", ["museos", "teatro", "tapas", "sierra"], { country: "España" }),
  destination("Comunidad Valenciana", "Valencia, Alicante, Castellón y calas", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 4, 100, "EUR", ["paella", "playas", "fiestas", "pueblos"], { country: "España" }),
  destination("Islas Baleares", "Mallorca, Menorca, Ibiza y Formentera", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 5, 145, "EUR", ["calas", "barcos", "fiesta", "senderismo"], { country: "España" }),
  destination("Islas Canarias", "Tenerife, Gran Canaria, Lanzarote y Fuerteventura", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 5, 125, "EUR", ["volcanes", "playas", "surf", "clima"], { country: "España" }),
  destination("Galicia", "Santiago, Rías Baixas, Costa da Morte y Lugo", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture"], 5, 90, "EUR", ["marisco", "camino", "rías", "faros"], { country: "España" }),
  destination("País Vasco", "Bilbao, San Sebastián, Rioja Alavesa y costa", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 4, 125, "EUR", ["pintxos", "museos", "surf", "montes"], { country: "España" }),
  destination("Castilla y León", "Salamanca, Segovia, Burgos, León y Ávila", "europe", ["mountain"], ["city", "countryside"], ["culture"], 4, 85, "EUR", ["catedrales", "castillos", "vino", "historia"], { country: "España" }),
  destination("Castilla-La Mancha", "Toledo, Cuenca, Almagro y molinos", "europe", ["mountain"], ["city", "countryside"], ["culture"], 3, 80, "EUR", ["molinos", "cascos históricos", "queso", "rutas"], { country: "España" }),
  destination("Aragón", "Zaragoza, Pirineo aragonés y Teruel", "europe", ["mountain"], ["city", "countryside"], ["culture"], 4, 90, "EUR", ["pirineos", "mudéjar", "pueblos", "nieve"], { country: "España" }),
  destination("Asturias", "Oviedo, Gijón, Picos de Europa y costa", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture"], 4, 95, "EUR", ["sidra", "montaña", "playas", "pueblos"], { country: "España" }),
  destination("Cantabria", "Santander, Santillana, Liébana y Costa Quebrada", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture"], 3, 95, "EUR", ["cuevas", "playas", "montaña", "anchoas"], { country: "España" }),
  destination("Navarra", "Pamplona, Selva de Irati y Bardenas Reales", "europe", ["mountain"], ["city", "countryside"], ["culture", "party"], 3, 90, "EUR", ["bardenas", "bosques", "san fermín", "pueblos"], { country: "España" }),
  destination("La Rioja", "Logroño, Haro y rutas de bodegas", "europe", ["mountain"], ["city", "countryside"], ["culture", "party"], 2, 95, "EUR", ["vino", "tapas", "bodegas", "monasterios"], { country: "España" }),
  destination("Extremadura", "Cáceres, Mérida, Trujillo y Monfragüe", "europe", ["mountain"], ["city", "countryside"], ["culture"], 3, 80, "EUR", ["romano", "dehesa", "aves", "pueblos"], { country: "España" }),
  destination("Región de Murcia", "Murcia, Cartagena, Lorca y Mar Menor", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture"], 3, 85, "EUR", ["playas", "huerta", "romano", "calas"], { country: "España" }),
  destination("Ceuta y Melilla", "Ceuta, Melilla y costa norteafricana española", "europe", ["beach"], ["city"], ["culture"], 2, 85, "EUR", ["murallas", "mezcla cultural", "playas", "frontera"], { country: "España" }),
  destination("Estados Unidos", "Nueva York, California y Florida", "america", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 7, 190, "USD", ["rascacielos", "parques", "road trip", "playas"]),
  destination("Italia", "Roma, Florencia y Costa Amalfitana", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 5, 135, "EUR", ["historia", "pasta", "arte", "costa"]),
  destination("Turquía", "Estambul, Capadocia y Antalya", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 6, 95, "TRY", ["bazares", "globos", "mezquitas", "costa"]),
  destination("México", "CDMX, Oaxaca y Riviera Maya", "america", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 8, 115, "MXN", ["ruinas", "tacos", "museos", "caribe"]),
  destination("Reino Unido", "Londres, Edimburgo y Bath", "europe", ["mountain"], ["city", "countryside"], ["culture", "party"], 4, 165, "GBP", ["teatro", "pubs", "museos", "castillos"]),
  destination("Alemania", "Berlín, Múnich y Selva Negra", "europe", ["mountain"], ["city", "countryside"], ["culture", "party"], 4, 130, "EUR", ["historia", "cerveza", "mercados", "bosques"]),
  destination("Grecia", "Atenas, Milos y Creta", "europe", ["beach"], ["city", "countryside"], ["culture", "party"], 6, 125, "EUR", ["islas", "historia", "tabernas", "atardeceres"]),
  destination("Austria", "Viena, Salzburgo y Tirol", "europe", ["mountain"], ["city", "countryside"], ["culture"], 4, 140, "EUR", ["música", "palacios", "alpes", "cafés"]),
  destination("Japón", "Tokio, Kioto y Osaka", "asia", ["mountain"], ["city", "countryside"], ["culture", "party"], 10, 155, "JPY", ["templos", "gastronomía", "trenes", "neón"]),
  destination("Emiratos Árabes Unidos", "Dubái y Abu Dabi", "asia", ["beach"], ["city", "countryside"], ["culture", "party"], 4, 175, "AED", ["rascacielos", "desierto", "playas", "compras"]),
  destination("Tailandia", "Bangkok, Chiang Mai y Phuket", "asia", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 9, 85, "THB", ["templos", "playas", "mercados", "islas"]),
  destination("Arabia Saudí", "Riad, Yeda y Al Ula", "asia", ["mountain"], ["city", "countryside"], ["culture"], 6, 145, "SAR", ["desierto", "arqueología", "mar rojo", "cultura"]),
  destination("Canadá", "Toronto, Vancouver y Rocosas", "america", ["mountain", "beach"], ["city", "countryside"], ["culture"], 8, 170, "CAD", ["lagos", "montañas", "ciudades", "naturaleza"]),
  destination("Polonia", "Cracovia, Varsovia y Gdansk", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 4, 85, "PLN", ["historia", "plazas", "castillos", "vodka"]),
  destination("Países Bajos", "Ámsterdam, Utrecht y Rotterdam", "europe", ["beach"], ["city", "countryside"], ["culture", "party"], 3, 150, "EUR", ["canales", "museos", "bicis", "diseño"]),
  destination("Portugal", "Lisboa, Porto y Algarve", "europe", ["beach"], ["city", "countryside"], ["culture", "party"], 4, 105, "EUR", ["costa", "vino", "azulejos", "vida nocturna"]),
  destination("China", "Pekín, Shanghái y Xi'an", "asia", ["mountain"], ["city", "countryside"], ["culture"], 9, 120, "CNY", ["muralla", "templos", "rascacielos", "gastronomía"]),
  destination("Malasia", "Kuala Lumpur, Penang y Langkawi", "asia", ["beach", "mountain"], ["city", "countryside"], ["culture"], 7, 80, "MYR", ["islas", "comida", "selva", "mezquitas"]),
  destination("Rusia", "Moscú y San Petersburgo", "europe", ["mountain"], ["city"], ["culture"], 6, 110, "RUB", ["palacios", "museos", "catedrales", "historia"]),
  destination("Croacia", "Dubrovnik, Split e islas dálmatas", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 5, 120, "EUR", ["costa", "islas", "murallas", "barcos"]),
  destination("Hungría", "Budapest y lago Balatón", "europe", ["beach"], ["city", "countryside"], ["culture", "party"], 3, 85, "HUF", ["termas", "ruin bars", "danubio", "palacios"]),
  destination("Chequia", "Praga, Brno y Cesky Krumlov", "europe", ["mountain"], ["city", "countryside"], ["culture", "party"], 3, 95, "CZK", ["castillos", "cerveza", "puentes", "plazas"]),
  destination("Marruecos", "Marrakech, Atlas y Essaouira", "africa", ["mountain", "beach"], ["city", "countryside"], ["culture"], 5, 80, "MAD", ["zocos", "desierto", "riad", "montañas"]),
  destination("Egipto", "El Cairo, Luxor y Mar Rojo", "africa", ["beach"], ["city", "countryside"], ["culture"], 7, 90, "EGP", ["pirámides", "templos", "nilo", "buceo"]),
  destination("República Dominicana", "Punta Cana, Santo Domingo y Samaná", "america", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 6, 125, "DOP", ["playas", "bachata", "resorts", "cascadas"]),
  destination("India", "Delhi, Jaipur, Agra y Kerala", "asia", ["beach", "mountain"], ["city", "countryside"], ["culture"], 10, 70, "INR", ["templos", "palacios", "especias", "taj mahal"]),
  destination("Vietnam", "Hanói, Ha Long y Hoi An", "asia", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 9, 65, "VND", ["bahías", "motos", "mercados", "arrozales"]),
  destination("Corea del Sur", "Seúl, Busan y Jeju", "asia", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 7, 125, "KRW", ["k-pop", "templos", "barrios", "comida"]),
  destination("Singapur", "Marina Bay, Chinatown y Sentosa", "asia", ["beach"], ["city"], ["culture", "party"], 3, 170, "SGD", ["skyline", "hawkers", "jardines", "isla"]),
  destination("Indonesia", "Bali, Lombok y Java", "asia", ["beach", "mountain"], ["countryside", "city"], ["culture", "party"], 10, 95, "IDR", ["playas", "arrozales", "volcanes", "beach clubs"]),
  destination("Brasil", "Río, Salvador y Florianópolis", "america", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 8, 110, "BRL", ["samba", "playas", "selva", "carnaval"]),
  destination("Argentina", "Buenos Aires, Iguazú y Patagonia", "america", ["mountain"], ["city", "countryside"], ["culture", "party"], 9, 100, "ARS", ["tango", "glaciares", "asado", "cataratas"]),
  destination("Australia", "Sídney, Melbourne y Queensland", "oceania", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 12, 190, "AUD", ["playas", "surf", "arrecife", "ciudades"]),
  destination("Suiza", "Zúrich, Lucerna y Alpes", "europe", ["mountain"], ["city", "countryside"], ["culture"], 5, 220, "CHF", ["alpes", "lagos", "trenes", "chocolate"]),
  destination("Bélgica", "Bruselas, Brujas y Gante", "europe", ["beach"], ["city"], ["culture", "party"], 3, 125, "EUR", ["cerveza", "canales", "chocolate", "plazas"]),
  destination("Suecia", "Estocolmo y archipiélago", "europe", ["beach", "mountain"], ["city", "countryside"], ["culture"], 5, 155, "SEK", ["diseño", "islas", "museos", "naturaleza"]),
  destination("Dinamarca", "Copenhague y Aarhus", "europe", ["beach"], ["city", "countryside"], ["culture", "party"], 4, 165, "DKK", ["diseño", "bicis", "canales", "gastronomía"]),
  destination("Irlanda", "Dublín, Galway y acantilados", "europe", ["mountain"], ["city", "countryside"], ["culture", "party"], 5, 145, "EUR", ["pubs", "acantilados", "música", "rutas"]),
  destination("Noruega", "Oslo, Bergen y fiordos", "europe", ["mountain", "beach"], ["city", "countryside"], ["culture"], 6, 205, "NOK", ["fiordos", "senderismo", "tren", "auroras"]),
  destination("Sudáfrica", "Ciudad del Cabo y Kruger", "africa", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 8, 120, "ZAR", ["safari", "viñedos", "costa", "montaña"]),
  destination("Túnez", "Túnez, Djerba y desierto", "africa", ["beach"], ["city", "countryside"], ["culture"], 5, 75, "TND", ["medinas", "playas", "ruinas", "desierto"]),
  destination("Qatar", "Doha y desierto", "asia", ["beach"], ["city", "countryside"], ["culture"], 3, 160, "QAR", ["museos", "zocos", "skyline", "desierto"]),
  destination("Nueva Zelanda", "Auckland, Queenstown e Isla Sur", "oceania", ["mountain", "beach"], ["countryside", "city"], ["culture"], 14, 185, "NZD", ["senderismo", "lagos", "fiordos", "van trip"]),
  destination("Filipinas", "Manila, Palawan y Cebú", "asia", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 10, 80, "PHP", ["islas", "buceo", "playas", "lagunas"]),
  destination("Camboya", "Siem Reap, Angkor y Phnom Penh", "asia", ["beach"], ["city", "countryside"], ["culture"], 6, 60, "KHR", ["templos", "mercados", "historia", "río"]),
  destination("Colombia", "Bogotá, Medellín y Cartagena", "america", ["beach", "mountain"], ["city", "countryside"], ["culture", "party"], 8, 90, "COP", ["café", "caribe", "música", "ciudades"]),
  destination("Perú", "Lima, Cusco y Machu Picchu", "america", ["mountain"], ["city", "countryside"], ["culture"], 8, 85, "PEN", ["andes", "ruinas", "gastronomía", "senderismo"]),
  destination("Chile", "Santiago, Atacama y Patagonia", "america", ["mountain", "beach"], ["city", "countryside"], ["culture"], 9, 120, "CLP", ["desierto", "patagonia", "vino", "lagos"])
];

export const proximity = {
  europe: { europe: 24, africa: 16, asia: 8, america: 4, oceania: 0 },
  "north-africa": { africa: 24, europe: 18, asia: 8, america: 3, oceania: 0 },
  "north-america": { america: 24, europe: 10, asia: 8, africa: 5, oceania: 4 },
  "latin-america": { america: 24, europe: 8, africa: 6, asia: 4, oceania: 2 },
  asia: { asia: 24, oceania: 12, europe: 8, africa: 4, america: 2 },
  oceania: { oceania: 24, asia: 16, america: 7, europe: 4, africa: 2 }
};
