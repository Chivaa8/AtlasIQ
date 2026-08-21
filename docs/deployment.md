# Despliegue de AtlasIQ

## Preparación

1. Copia `.env.example` a `.env` en el servidor y reemplaza todos los valores de ejemplo.
2. Usa una contraseña de PostgreSQL única y un `AUTH_SECRET` aleatorio de al menos 32 caracteres.
3. Cambia `APP_URL`, `robots.txt` y `sitemap.xml` al dominio definitivo.
4. Ejecuta `docker compose -f compose.production.yaml up -d --build`.
5. Comprueba `/api/health` y `/api/metrics`.

## HTTPS y dominio

Publica el puerto 8022 detrás del proxy HTTPS gestionado del proveedor (Cloudflare, Render, Railway o equivalente). Activa redirección HTTP→HTTPS, TLS automático y conecta el dominio por DNS. PostgreSQL y la API no exponen puertos públicos.

## Operación

- Envía los logs JSON de Docker al servicio de logs del proveedor.
- Vigila `/api/health` cada minuto y alerta tras tres fallos.
- Recoge `/api/metrics` con Prometheus o el monitor compatible del proveedor.
- Programa `pnpm db:backup` diariamente y conserva copias cifradas fuera del servidor; prueba una restauración mensualmente.
- Para analítica privada, conecta una instancia de Umami o Plausible y carga su script solo después de que el visitante acepte analítica.
- Configura en Stripe el webhook público `https://tu-dominio/api/payments/webhook`.

## Publicación segura

Ejecuta `pnpm test`, `pnpm test:e2e` y `pnpm audit --audit-level=high` antes de desplegar. Nunca copies `.env`, backups ni claves al repositorio. Rota cualquier secreto expuesto y revisa las alertas del proveedor después de cada publicación.
