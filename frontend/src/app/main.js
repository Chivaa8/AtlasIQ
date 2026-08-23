import { mountAdvisorRoute } from "../routes/advisor.js?v=20260820-ux2";
import { mountPageNavigation } from "./pages.js";
import { mountAuthRoute, showApp } from "../routes/auth.js?v=20260820-ux2";
import { mountProfileRoute } from "../routes/profile.js?v=20260820-ux2";
import { mountTripDetailRoute } from "../routes/trip-detail.js?v=20260820-ux2";
import { mountTripsRoute } from "../routes/trips.js?v=20260820-ux2";
import { mountExtrasRoute } from "../routes/extras.js?v=20260820-ux2";
import { mountPaymentsRoute } from "../routes/payments.js?v=20260820-ux2";
import { mountToolsRoute } from "../routes/tools.js";
import { mountBookingsRoute } from "../routes/bookings.js?v=20260820-ux2";
import { mountLegal } from "./legal.js";
import { mountAdminRoute } from "../routes/admin.js";
import { mountUi, notify } from "./ui.js?v=20260820-ux2";

mountUi();
mountAuthRoute();
mountPageNavigation();
mountAdvisorRoute();
mountProfileRoute();
mountTripsRoute();
mountTripDetailRoute();
mountExtrasRoute();
mountPaymentsRoute();
mountToolsRoute();
mountBookingsRoute();
mountLegal();
mountAdminRoute();
showApp();
showCheckoutResult();

function showCheckoutResult() {
  const url = new URL(window.location.href);
  const result = url.searchParams.get("payment");
  if (!result) return;
  const message = document.querySelector("#checkoutMessage");
  message.textContent = result === "success"
    ? "Pago de prueba completado. Puedes consultar el estado en Pagos."
    : "Pago cancelado. No se ha realizado ningún cargo.";
  message.classList.toggle("success", result === "success");
  message.classList.toggle("error", result !== "success");
  notify(message.textContent, result === "success" ? "success" : "error");
  url.searchParams.delete("payment");
  url.searchParams.delete("session_id");
  history.replaceState(null, "", url);
}
