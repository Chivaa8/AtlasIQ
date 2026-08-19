# AtlasIQ

AtlasIQ es un planificador inteligente de viajes pensado como proyecto portfolio: itinerario, presupuesto, documentacion, clima, divisas y recomendaciones.

## Estructura

```text
AtlasIQ/
  frontend/   MVP web usable
  backend/    API futura
  ml/         recomendador futuro
  infra/      Docker y despliegue
  docs/       arquitectura y decisiones
```

## Ejecutar

Puertos fijos:

- Frontend: `http://127.0.0.1:8022`
- Backend API: `http://127.0.0.1:8023`
- Tests HTTP backend: `http://127.0.0.1:8024`

```bash
npm run dev:backend
npm run dev:frontend
```

## Correo de recuperación

1. Copia `.env.example` como `.env`.
2. Añade tu clave de Resend y un remitente verificado.
3. Reinicia `npm run dev:backend`.

Para probar sin dominio propio, Resend permite `AtlasIQ <onboarding@resend.dev>` con el Gmail asociado a la cuenta de Resend como destinatario.

## Checks

```bash
npm test
```

## Pagos con Stripe

AtlasIQ usa Stripe Checkout alojado y no almacena datos de tarjeta.

1. Copia `.env.example` como `.env`.
2. Configura `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` con claves de prueba.
3. Envía webhooks de Stripe a `http://localhost:8023/api/payments/webhook`.
4. Escucha al menos `checkout.session.completed` y `checkout.session.expired`.

Sin esas variables, AtlasIQ sigue funcionando pero bloquea correctamente la creación de pagos reales.

## PostgreSQL local

```powershell
docker compose up -d postgres
node --env-file-if-exists=.env backend/scripts/db.js migrate
node --env-file-if-exists=.env backend/scripts/db.js import-json
```

Configura `DATABASE_URL` como en `.env.example`. Con esa variable, la API usa PostgreSQL; sin ella conserva el modo JSON para pruebas aisladas.

- `db:migrate`: crea o actualiza el esquema.
- `db:import-json`: importa los usuarios, viajes, acompañantes y pagos existentes.
- `db:backup`: guarda una copia en `backups/atlasiq.json`.
- `db:restore -- backups/atlasiq.json`: restaura esa copia.

PostgreSQL guarda usuarios, viajes, acompañantes, reservas, pagos, reseñas, favoritos, preferencias y pagos previstos. Las relaciones eliminan automáticamente los datos dependientes cuando se elimina un usuario o viaje.

## Seguridad local

- Genera `AUTH_SECRET` con al menos 32 caracteres; la API no arranca sin él.
- Acceso, registro, recuperación y reseñas tienen límites de frecuencia.
- Las sesiones duran siete días, pueden renovarse y se revocan al cerrar sesión o cambiar la contraseña.
- Las cuentas nuevas admiten verificación de correo mediante código de 30 minutos.
- Las peticiones JSON están limitadas a 1 MB y la API añade cabeceras defensivas.
- La web incluye consentimiento de cookies, privacidad y condiciones de uso.

La limitación de frecuencia está en memoria para el desarrollo local. En producción con varias instancias debe compartirse mediante Redis o el proxy de entrada.

## Correo con Resend

1. Añade en Resend un subdominio propio, por ejemplo `send.atlasiq.com`.
2. Copia en tu proveedor DNS los registros SPF y DKIM indicados y espera a que el dominio aparezca como verificado.
3. Crea una clave restringida exclusivamente al envío de correo.
4. Guarda la clave en `RESEND_API_KEY` y usa `EMAIL_FROM=AtlasIQ <noreply@tu-subdominio>`.

La recuperación siempre devuelve la misma respuesta exista o no la cuenta. Los códigos se guardan como hash, caducan en 15 minutos y solo se envía uno por minuto. Resend recibe una plantilla HTML y una alternativa de texto. Las claves y códigos nunca deben guardarse en Git.

## Roadmap corto

1. Mejorar el MVP visual en `frontend/`.
2. Migrar frontend a Angular cuando la interfaz este clara.
3. Crear backend NestJS con viajes, usuarios, presupuesto e itinerario.
4. Sustituir el recomendador heuristico por ML cuando haya datos.

## Stack objetivo

Angular, NestJS, PostgreSQL, Redis, Docker, JWT, WebSockets, Google Maps, Weather API, Amadeus API, Cloudinary, Swagger y tests.
