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

## Checks

```bash
npm test
```

## Roadmap corto

1. Mejorar el MVP visual en `frontend/`.
2. Migrar frontend a Angular cuando la interfaz este clara.
3. Crear backend NestJS con viajes, usuarios, presupuesto e itinerario.
4. Sustituir el recomendador heuristico por ML cuando haya datos.

## Stack objetivo

Angular, NestJS, PostgreSQL, Redis, Docker, JWT, WebSockets, Google Maps, Weather API, Amadeus API, Cloudinary, Swagger y tests.
