# Calidad y pendientes

## Punto 7 cubierto

- Pruebas unitarias de frontend y backend.
- Flujo E2E de registro, perfil, creación de viaje y opciones guardadas.
- Recuperación de contraseña, vista móvil y auditoría Axe.
- Chrome, Edge, Firefox y WebKit como equivalente automatizado del motor de Safari.
- Cabeceras de seguridad y presupuesto básico de carga.
- CI en cada `push` a `main` y en cada pull request.

Chrome, Edge y WebKit pasan también en Windows. El Firefox headless de Playwright no inicia en este equipo por un error SWGL del propio binario; Firefox queda cubierto por el agente Linux de CI.

## Punto 8 preparado

- Contenedores separados para frontend, API y PostgreSQL mediante `compose.production.yaml`.
- Proxy de `/api`, compresión, caché y cabeceras seguras en Nginx.
- Secretos únicamente por variables de entorno y base de datos sin puerto público.
- Healthcheck, logs JSON y métricas Prometheus en `/api/metrics`.
- SEO, metadatos sociales, manifest, sitemap y robots.
- Guía de despliegue, HTTPS, copias, monitorización y analítica privada en `docs/deployment.md`.

Para publicar todavía hay que escoger proveedor y dominio, cargar los secretos reales y crear las alertas externas. Safari real, dispositivos físicos y presupuestos con tráfico solo pueden validarse después del despliegue.

## Punto 9 cubierto

- Retirado `package-lock.json`; pnpm es el único gestor del proyecto.
- Reparado npm en Windows apartando su instalación global dañada de forma recuperable.
- Eliminadas las iteraciones antiguas y los archivos aplanados duplicados de la raíz.
- Conservada únicamente la estructura vigente de aplicación, pruebas, CI y documentación.
- Añadida licencia MIT y documentación actualizada de arquitectura, despliegue y recuperación.

## Pendientes funcionales posteriores

- Dominio de correo real para enviar recuperación y verificación a cualquier usuario.
- Soporte y gestión interna de incidencias, cancelaciones y disputas.
- Revisión profesional de privacidad, cookies, condiciones y seguros antes de operar comercialmente.
- Contratos o API de proveedor cuando AtlasIQ quiera confirmar reservas dentro de la propia web en vez de redirigir al comparador.
