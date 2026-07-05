# Arquitectura

AtlasIQ empieza con un MVP estatico para validar producto, interfaz y portfolio sin bloquearse con APIs externas.

## Capas

- `frontend/`: experiencia de usuario, itinerario, presupuesto, checklist y visualizacion.
- `backend/`: autenticacion, persistencia, colaboracion y APIs externas.
- `ml/`: ranking de actividades y optimizacion de itinerario.
- `infra/`: Docker, variables de entorno, PostgreSQL, Redis y despliegue.

## Backend previsto

- NestJS
- PostgreSQL
- JWT
- Swagger
- Tests

Modulos iniciales:

- users
- trips
- itinerary
- budget
- documents

## ML previsto

El recomendador actual vive en `frontend/recommendation.js` y usa scoring heuristico.

Entrada futura:

- destino
- presupuesto diario
- dias disponibles
- estilo del viaje
- preferencias historicas
- clima
- distancia entre actividades

Salida futura:

- ranking de actividades
- score de ajuste
- coste estimado

## Decisiones

- Sin APIs reales hasta cerrar el flujo principal.
- Sin framework ML hasta tener datos.
- Documentos y usuarios reales iran en backend, no en localStorage.
