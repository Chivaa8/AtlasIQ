export function parseTripPreferences(data, origin) {
  return {
    goal: data.get("goal").trim(),
    continent: data.get("continent"),
    landscape: data.get("landscape"),
    environment: data.get("environment"),
    vibe: data.get("vibe"),
    days: Number(data.get("days")),
    budget: Number(data.get("budget")),
    origin
  };
}
