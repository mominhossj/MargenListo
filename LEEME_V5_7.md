# MargenListo V5.7 — Beta de desarrollo (21 octubre 2026)

## Cambios comprobados
- Dashboard de rentabilidad filtrable por mes y canal, sin alterar el historial.
- Tabla «Mes a mes»: total, facturación, ganancia y operaciones con pérdida de todos los meses registrados.
- Exportación «CSV completo» y «CSV de la vista». En Android cada uno tiene nombre de archivo independiente.
- Prohibido perder registros corruptos silenciosamente: se bloquea su sobrescritura hasta importar manualmente un respaldo válido.
- Se conservan los cálculos por centavos enteros de la versión V5.6, los respaldos JSON v1 y el límite de 1.000 ventas.
- El flujo GitHub Actions ejecuta tests/reporting.spec.js y tests/data_integrity.spec.js antes de intentar compilar el APK.

## Límites y precauciones
- NO ES UN APK: código fuente Android Studio y configuración de CI, sin compilación real en este entorno.
- NO está publicado; no sustituir el sitio en Cloudflare con este ZIP de Android.
- Las pruebas de Chromium usan un entorno de navegador aislado, NO verifican Android WebView, instalación ni modo offline en celular.
- No hay análisis antivirus de Microsoft Defender ni auditoría independiente; si hay alertas, no forzar descarga ni desactivar protección.
- La app no tiene anuncios, SDK publicitarios ni permiso de Internet. Su instalación gratuita por sí sola no genera ingresos.
- No comprometer la clave de firma si se prepara posteriormente un build release.
- Hacer respaldo JSON antes de cambiar/actualizar apps de depuración en un teléfono; claves debug pueden variar.

## Compilación
1. Abrir este proyecto con Android Studio con JDK 17, API 36 y Gradle compatible, o subirlo a un repositorio PRIVADO de GitHub.
2. GitHub Actions > «MargenListo Android - Compilacion beta (manual)» > Run workflow.
3. Si el job acaba en verde, descargar SOLO para prueba el APK debug del artefacto.
4. Analizar con Defender y probar en teléfono propio antes de distribuir. La publicación exige firma release/AAB y cumplimiento de Play Console.

## Estado
Calculadora + registro + reportes y exportación: desarrollados y probados parcialmente en navegador.
APK, instalación Android real, publicación, monetización: PENDIENTES.
