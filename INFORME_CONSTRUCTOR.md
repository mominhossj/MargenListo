# MargenListo V5.7 — Informe de preparación APK

**Fecha:** 2026-10-21. **Resultado:** fuentes listas para intentar compilar; APK NO generado ni verificado físicamente.

## Verificaciones efectuadas

- Se examinaron los archivos de fuentes V5.7 y se conservó exactamente la misma versión de los recursos HTML/CSS/JS Android; no se modificaron algoritmos ni historial.
- Se ejecutaron 49 pruebas del motor, 50.000 operaciones aleatorias de precisión financiera, 20 pruebas de informes mensuales, 6 de importación, 9 comprobaciones de integridad de registros, 20 controles de rutas, 10 pruebas de lectura Java y controles estáticos Android API 36.
- Se ejecutó el test de interfaz en Chromium en 390 y 1280 px para el registro de ventas, filtros, exportación y navegación interna de la pantalla. No equivale a una prueba en WebView Android.
- La nueva comprobación de archivos empaquetados validó 31 recursos locales referenciados. Los controles sintéticos del verificador APK validaron un caso correcto y rechazaron 3 casos incorrectos.
- Se comprobó que la configuración GitHub Actions usa android-actions/setup-android@v4 y gradle/actions/setup-gradle@v6, con Gradle 8.13, AGP 8.13.2, API 36, SDK Build Tools 35.0.0 y Java 17.
- El workflow, DESPUÉS de compilar en GitHub, verificará con `apksigner verify` la firma DEBUG, con `aapt` el identificador `app.margenlisto.mobile`, `minSdk 26`, `targetSdk 36`, que no existan permisos Android adicionales; también validará contenido del ZIP y producirá un SHA-256 del APK.

## Límites reales / acciones pendientes

- **No se generó un APK** porque este entorno no tiene Android SDK ni Gradle y bloquea las descargas externas desde la terminal.
- No se probó instalación, navegación física, exportación con FileProvider ni importación con selector de Android en un celular.
- No se realizó análisis antivirus independiente. Los hashes verifican integridad, no seguridad contra malware.
- La conexión GitHub no ofrece un repositorio MargenListo actualmente; no se pudo iniciar un job remoto.
- No se tocó producción Cloudflare, Pistacho, ningún banco ni ninguna cuenta.

## Contenido nuevo del paquete

- `scripts/check-source.sh`: ejecuta pruebas antes del build.
- `scripts/verify-package.py`: verifica que recursos offline no apunten a fuentes externas.
- `scripts/verify-apk.py`: validación del contenido del APK una vez generado.
- `tests/verify_apk_spec.py`: pruebas negativas de esa verificación.
- `scripts/compilar-en-windows.ps1`: automatiza Gradle 8.13 local en Windows y valida checksum del distribuidor.
- `.github/workflows/android-debug.yml`: compila en GitHub y verifica el APK Debug, disponible como artefacto.
- `SOURCE_SHA256.txt`: hashes de los archivos incluidos.

## No apto todavía para distribución en Google Play

Para publicar hace falta un AAB firmado con clave de release administrada por el dueño, ficha y declaración de privacidad, revisión de políticas de facturación, pruebas reales y los procesos de prueba de Google Play que correspondan.
