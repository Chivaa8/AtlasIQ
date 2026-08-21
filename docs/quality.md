# Calidad y pendientes

## Punto 7 cubierto

- Pruebas unitarias de frontend y backend.
- Flujo E2E de registro, perfil, creación de viaje y opciones guardadas.
- Recuperación de contraseña, vista móvil y auditoría Axe.
- Chrome, Edge, Firefox y WebKit como equivalente automatizado del motor de Safari.
- Cabeceras de seguridad y presupuesto básico de carga.
- CI en cada `push` a `main` y en cada pull request.

Chrome, Edge y WebKit pasan también en Windows. El Firefox headless de Playwright no inicia en este equipo por un error SWGL del propio binario; Firefox queda cubierto por el agente Linux de CI.

## Pendiente para el punto 8

- Elegir dominio, proveedor de alojamiento y entorno de producción.
- HTTPS, secretos del entorno, base de datos y copias de seguridad gestionadas.
- Logs, métricas, alertas, analítica privada, SEO, sitemap y robots.
- Pruebas finales en Safari real de macOS/iOS y dispositivos físicos.
- Presupuestos de rendimiento con datos y tráfico de producción.

## Pendiente para el punto 9

- Retirar el antiguo `package-lock.json`; el proyecto ya usa pnpm como gestor principal.
- Corregir la instalación global rota de npm en Windows.
- Revisar archivos históricos de la raíz y conservar solo la estructura vigente.
- Añadir licencia y documentación completa de despliegue y recuperación.

## Pendientes funcionales posteriores

- Panel de administración, roles, bloqueo de usuarios y moderación de reseñas.
- Exportación y eliminación de cuenta y datos personales.
- Dominio de correo real para enviar recuperación y verificación a cualquier usuario.
- Soporte y gestión interna de incidencias, cancelaciones y disputas.
- Revisión profesional de privacidad, cookies, condiciones y seguros antes de operar comercialmente.
- Contratos o API de proveedor cuando AtlasIQ quiera confirmar reservas dentro de la propia web en vez de redirigir al comparador.
