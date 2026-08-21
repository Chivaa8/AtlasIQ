# Arquitectura

AtlasIQ es una aplicación web de viajes con frontend estático, API Node.js y persistencia PostgreSQL.

## Capas

- `frontend/`: interfaz, rutas, esquemas, servicios y pruebas unitarias.
- `backend/`: autenticación, viajes, pagos, correo, persistencia y pruebas.
- `tests/`: recorridos E2E en navegadores reales.
- `docs/`: operación, arquitectura y calidad.
- `compose*.yaml`: PostgreSQL local y despliegue de producción.

## Stack actual

- JavaScript y Node.js
- PostgreSQL
- HTML y CSS nativos
- Docker y Nginx
- Playwright y GitHub Actions

Módulos principales:

- users
- trips
- payments
- reviews
- favorites
- password reset

## Recomendador

El recomendador vive en `frontend/src/services/recommendation.js` y usa puntuación heurística explicable.

Entradas:

- destino
- presupuesto diario
- dias disponibles
- estilo del viaje
- preferencias historicas
- clima
- distancia entre actividades

Salidas:

- ranking de actividades
- score de ajuste
- coste estimado

## Decisiones

- Sin framework frontend mientras JavaScript nativo cubra el producto.
- Sin modelo ML hasta disponer de datos suficientes para mejorarlo frente a la heurística.
- Los datos de cuenta y viajes se guardan en el backend; el almacenamiento local conserva la sesión y preferencias de interfaz.
