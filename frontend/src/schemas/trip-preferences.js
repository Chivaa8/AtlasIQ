export function parseTripPreferences(data, origin) {
  return {
    goal: data.get("goal").trim(),
    tripScope: data.get("tripScope") || "any",
    continent: data.get("continent"),
    landscape: data.get("landscape"),
    environment: data.get("environment"),
    vibe: data.get("vibe"),
    flightMode: data.get("flightMode") || "any",
    stopoverDays: Number(data.get("stopoverDays") || 0),
    rentalMode: data.get("rentalMode") || "any",
    days: Number(data.get("days")),
    budget: Number(data.get("budget")),
    origin
  };
}
