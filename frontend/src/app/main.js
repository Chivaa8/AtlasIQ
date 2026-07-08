import { mountAdvisorRoute, renderRecommendations } from "../routes/advisor.js";
import { mountAuthRoute, showApp } from "../routes/auth.js";
import { mountProfileRoute } from "../routes/profile.js";
import { mountTripDetailRoute } from "../routes/trip-detail.js";
import { mountTripsRoute } from "../routes/trips.js";

mountAuthRoute();
mountAdvisorRoute();
mountProfileRoute();
mountTripsRoute();
mountTripDetailRoute();
showApp();
