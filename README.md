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

## Roadmap corto

1. Mejorar el MVP visual en `frontend/`.
2. Migrar frontend a Angular cuando la interfaz este clara.
3. Crear backend NestJS con viajes, usuarios, presupuesto e itinerario.
4. Sustituir el recomendador heuristico por ML cuando haya datos.

## Stack objetivo

Angular, NestJS, PostgreSQL, Redis, Docker, JWT, WebSockets, Google Maps, Weather API, Amadeus API, Cloudinary, Swagger y tests.
