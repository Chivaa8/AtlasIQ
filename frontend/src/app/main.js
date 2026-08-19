import { mountAdvisorRoute } from "../routes/advisor.js?v=20260710-country-images";
import { mountPageNavigation } from "./pages.js";
import { mountAuthRoute, showApp } from "../routes/auth.js?v=20260710-country-images";
import { mountProfileRoute } from "../routes/profile.js";
import { mountTripDetailRoute } from "../routes/trip-detail.js";
import { mountTripsRoute } from "../routes/trips.js";
import { mountExtrasRoute } from "../routes/extras.js";
import { mountPaymentsRoute } from "../routes/payments.js";
import { mountToolsRoute } from "../routes/tools.js";
import { mountBookingsRoute } from "../routes/bookings.js";
import { mountLegal } from "./legal.js";

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
  url.searchParams.delete("payment");
  url.searchParams.delete("session_id");
  history.replaceState(null, "", url);
}
