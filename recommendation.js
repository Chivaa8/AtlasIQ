(function (root) {
  const activityPool = [
    { city: "Tokyo", title: "Shibuya, Asakusa y cena izakaya", tags: ["culture", "food"], cost: 120, hours: 8 },
    { city: "Tokyo", title: "Museo digital y ruta de ramen", tags: ["culture", "food"], cost: 95, hours: 6 },
    { city: "Hakone", title: "Onsen, lago Ashi y vistas al Fuji", tags: ["nature", "balanced"], cost: 180, hours: 9 },
    { city: "Kyoto", title: "Fushimi Inari, Gion y templos", tags: ["culture", "balanced"], cost: 80, hours: 7 },
    { city: "Nara", title: "Excursion a Nara y parque historico", tags: ["nature", "culture"], cost: 65, hours: 6 },
    { city: "Osaka", title: "Dotonbori, street food y castillo", tags: ["food", "culture"], cost: 90, hours: 7 },
    { city: "Hiroshima", title: "Memorial, Miyajima y ferry", tags: ["culture", "nature"], cost: 210, hours: 10 }
  ];

  function optimizeTrip(trip) {
    const dailyBudget = trip.budget / trip.days;
    const ranked = activityPool
      .map((activity) => ({ ...activity, score: scoreActivity(activity, trip.style, dailyBudget) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(trip.days, activityPool.length));

    const total = ranked.reduce((sum, item) => sum + item.cost, 0) + trip.days * 85;
    const averageScore = Math.round(ranked.reduce((sum, item) => sum + item.score, 0) / Math.max(ranked.length, 1));

    return { ranked, total, averageScore };
  }

  function scoreActivity(activity, style, dailyBudget) {
    const styleMatch = style === "balanced" || activity.tags.includes(style) ? 45 : 18;
    const budgetFit = Math.max(0, 35 - Math.abs(activity.cost - dailyBudget * 0.45) / 6);
    const timeFit = activity.hours <= 8 ? 20 : 12;
    // ponytail: baseline heuristic; replace with a trained model when real user preference data exists.
    return Math.round(styleMatch + budgetFit + timeFit);
  }

  root.AtlasIQ = { optimizeTrip };

  if (typeof module !== "undefined") {
    module.exports = root.AtlasIQ;
  }
})(typeof window === "undefined" ? globalThis : window);
