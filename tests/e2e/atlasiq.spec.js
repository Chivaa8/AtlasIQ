import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("registro, perfil, viaje y reserva guardada", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Crear usuario" }).click();
  await page.locator("#registerForm").getByLabel("Nombre").fill("Persona E2E");
  await page.locator("#registerForm").getByLabel("Email").fill(email);
  await page.locator("#registerForm").getByLabel("Contraseña").fill("Segura123");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  const profile = page.locator("#profileForm");
  await expect(profile).toBeVisible();
  await profile.getByLabel("Primer apellido").fill("Pruebas");
  await profile.getByLabel("DNI o pasaporte").fill("TEST1234");
  await profile.getByLabel("Número de teléfono").fill("+34600000000");
  await profile.getByRole("button", { name: "Guardar perfil" }).click();
  await expect(page.getByRole("heading", { name: "Tu próximo viaje empieza aquí." })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Menú" }).click();
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toBeVisible();
  await page.getByRole("button", { name: "Planificador" }).click();
  await page.locator("[data-create-trip]").first().click();
  await expect(page.getByRole("heading", { name: "Mis viajes" })).toBeVisible();
  await expect(page.locator(".trip-card")).toHaveCount(1);
  await page.locator("[data-trip-id]").click();
  await expect(page.locator("#tripItinerary > li")).toHaveCount(5);
  await expect(page.getByRole("heading", { name: "Salud y vacunas" })).toBeVisible();
  await page.getByRole("button", { name: "Volver" }).click();

  await page.getByRole("button", { name: "Menú" }).click();
  await page.getByRole("button", { name: "Reservas" }).click();
  await page.locator("#bookingFilters").getByLabel("Tipo").selectOption("guide");
  await expect(page.locator(".booking-card")).toHaveCount(3);
  await page.locator("[data-save-offer]").first().click();
  await expect(page.locator("#savedOfferCount")).toHaveText("1");
  await page.locator("#bookingFilters").getByLabel("Tipo").selectOption("insurance");
  await expect(page.locator(".booking-card")).toHaveCount(4);
  await expect(page.locator("button:disabled")).toHaveCount(0);
});

test("recuperación y accesibilidad", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "¿Has olvidado la contraseña?" }).click();
  await expect(page.getByRole("heading", { name: "Recuperar acceso" })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("panel de administración protegido", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Crear usuario" }).click();
  await page.locator("#registerForm").getByLabel("Nombre").fill("Admin E2E");
  await page.locator("#registerForm").getByLabel("Email").fill("admin-e2e@atlasiq.local");
  await page.locator("#registerForm").getByLabel("Contraseña").fill("Segura123");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  const profile = page.locator("#profileForm");
  await profile.getByLabel("Primer apellido").fill("Pruebas");
  await profile.getByLabel("DNI o pasaporte").fill("ADMIN123");
  await profile.getByLabel("Número de teléfono").fill("+34600000001");
  await profile.getByRole("button", { name: "Guardar perfil" }).click();
  await expect(page.getByRole("button", { name: "Administración" })).toBeVisible();
  await page.getByRole("button", { name: "Administración" }).click();
  await expect(page.getByRole("heading", { name: "Usuarios y moderación" })).toBeVisible();
  await expect(page.locator("#adminUsers")).toContainText("admin-e2e@atlasiq.local");
});

test("cabeceras de seguridad y presupuesto de carga", async ({ page, request }) => {
  const started = Date.now();
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response.ok()).toBeTruthy();
  expect(Date.now() - started).toBeLessThan(5000);
  expect((await response.body()).byteLength).toBeLessThan(250_000);

  const health = await request.get("http://127.0.0.1:8023/api/health");
  expect(health.headers()["x-content-type-options"]).toBe("nosniff");
  expect(health.headers()["x-frame-options"]).toBe("DENY");
  expect(health.headers()["cache-control"]).toBe("no-store");
});
