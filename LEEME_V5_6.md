# MargenListo Android V5.6 — Beta de código fuente

## Qué cambió
- Motor del registro de ventas `ledger-core.js` ahora calcula con centavos enteros y porcentajes en puntos básicos, usando BigInt en operaciones intermedias.
- Mantiene compatibilidad con el modelo de respaldos JSON v1. Se rechazan importes/porcentajes con más de 2 decimales para evitar valores ocultos que alteren el resultado.
- Actualización de versión Android a `versionCode 6`, `versionName 0.5.6-beta`.
- Corrección del número de versión en la interfaz.
- 50.000 operaciones financieras adicionales reproducibles en `tests/financial-precision.spec.js`.
- Flujo de GitHub Actions ahora ejecuta esas pruebas antes de intentar el APK.

## Estado REAL
- **No es un APK ni una app distribuible**: NO se compiló en este entorno (sin Android SDK/Gradle y sin acceso a descargar dependencias).
- **No es una certificación antivirus**. No desactives Defender ni fuerces una descarga bloqueada.
- No se ha publicado ni subido código a GitHub ni modificado Cloudflare.

## Cómo compilar con GitHub Actions
1. Crear un repositorio **privado** llamado `margenlisto-android-beta` en GitHub (si las políticas y cuotas del plan lo permiten). No compartir contraseñas ni claves.
2. Extraer y subir el contenido del ZIP completo; asegurarse de incluir la carpeta oculta `.github/workflows/` y el archivo `settings.gradle` en la raíz.
3. Ir a **Actions** > **MargenListo Android - Compilacion beta (manual)** > **Run workflow**.
4. Si termina en verde, descargar el artefacto `MargenListo-Android-DEBUG-NoDistribuir`. Comprobar el SHA-256 y analizar con Defender; realizar prueba en un dispositivo propio.
5. Si falla, usar el primer error de `Compilar Android APK de depuracion`; NO afirmar que el APK existe.

## Riesgos y restricciones
- El APK **debug** no se publica en Google Play; para publicar se exige preparar build tipo release en AAB, firmar con clave protegida y validar políticas.
- **La clave debug de GitHub puede variar entre compilaciones**, de modo que instalar otra compilación puede requerir desinstalar y borrar los datos locales. Exportar siempre el respaldo JSON antes de pruebas.
- Android sin permiso de Internet; la app no contiene anuncios ni cobros. Ingresos por anuncios requerirían cambios y cumplimiento de políticas, y no proceden de la descarga gratuita en sí.
- Faltan: compilación, prueba real en Android, análisis malware independiente, accesibilidad, prueba de actualizaciones y restauración de respaldo en dispositivo real.
