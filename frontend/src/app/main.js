import { mountAdvisorRoute, renderRecommendations } from "../routes/advisor.js";
import { mountAuthRoute, showApp } from "../routes/auth.js";
import { mountProfileRoute } from "../routes/profile.js";

mountAuthRoute();
mountAdvisorRoute();
mountProfileRoute();
showApp();
renderRecommendations();
