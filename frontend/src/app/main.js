import { mountAdvisorRoute } from "../routes/advisor.js";
import { mountPageNavigation } from "./pages.js";
import { mountAuthRoute, showApp } from "../routes/auth.js";
import { mountProfileRoute } from "../routes/profile.js";
import { mountTripDetailRoute } from "../routes/trip-detail.js";
import { mountTripsRoute } from "../routes/trips.js";

mountAuthRoute();
mountPageNavigation();
mountAdvisorRoute();
mountProfileRoute();
mountTripsRoute();
mountTripDetailRoute();
showApp();
