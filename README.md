# AtlasIQ

Planificador inteligente de viajes para portfolio: itinerario, presupuesto, checklist, documentacion, clima, divisas y recomendacion de actividades.

## MVP actual

- Prototipo web estatico, sin instalacion.
- Motor de recomendacion local con scoring por estilo, coste y tiempo.
- Vista responsive con mapa conceptual, metricas e itinerario dia por dia.
- Check runnable del recomendador.

## Ejecutar

Abre `index.html` en el navegador.

Para comprobar la logica:

```bash
node test-recommendation.js
```

## Roadmap portfolio

1. Angular: convertir este prototipo en SPA con componentes.
2. NestJS + PostgreSQL: viajes, usuarios, presupuestos, documentos y actividades.
3. JWT: cuentas y viajes compartidos.
4. Redis + WebSockets: colaboracion en tiempo real.
5. APIs: Google Maps, Weather, Amadeus y divisas.
6. IA/ML: sustituir el heuristic scorer por ranking entrenado con preferencias reales.
7. Cloudinary: album de fotos del viaje.
8. Docker + Swagger + tests: entrega profesional para reclutadores.

## Nota de alcance

Este repo empieza por lo que un reclutador puede abrir y entender en segundos. Las integraciones reales entran cuando el producto base ya tenga flujo y datos.
