# MargenListo Android — Compilación beta verificable

**Estado: solo código fuente + CI. No hay APK probado, firmado ni publicado.**

## Qué contiene este complemento
- `.github/workflows/android-debug.yml`: compilación manual de APK DEBUG usando Java 17, Android SDK 36 y Gradle 8.13.
- `tests/ledger-core.spec.js`: 49 comprobaciones del registro de ventas.
- `tests/check_assets.py`: validación básica del manifiesto Android, permisos, configuración de WebView y presencia de recursos.

**Importante:** este complemento NO reemplaza el proyecto fuente Android V5.1. No contiene `app.js`, ni es un APK. Los tres archivos se añaden a la **raíz** del proyecto Android Studio.

## Camino recomendado: Android Studio en Windows (sin GitHub)
1. Abrí el proyecto fuente V5.1 con Android Studio actualizado. Instalá Android SDK Platform 36.
2. Configurá JDK 17 y Gradle 8.13; el proyecto usa Android Gradle Plugin 8.13.2.
3. Ejecutá `Build > Make Project` y luego `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
4. **No distribuyas el APK** hasta instalarlo en un teléfono propio, revisar la alarma de Defender e inspeccionar el comportamiento de importación/exportación.

## Alternativa: compilación en GitHub Actions
1. Creá un repositorio **privado** en GitHub; agregá *solo* las fuentes Android y este complemento, con `app/build/`, `.gradle/`, `local.properties`, claves `.jks` o `.keystore` excluidas.
2. Confirmá que el proyecto raíz del repositorio tenga `settings.gradle`, `build.gradle` y la carpeta `app/`.
3. En GitHub abrí `Actions > MargenListo Android - Compilacion beta (manual) > Run workflow`.
4. Si las verificaciones y compilación terminan correctamente, el artefacto se llamará `MargenListo-Android-DEBUG-NoDistribuir`. Descargalo **solo para pruebas internas**.
5. No publiques un APK debug en Google Play. Para Play se necesita un AAB de release firmado con clave privada de tu propiedad, que no se comparte en el chat.

El workflow descarga herramientas de sus proveedores oficiales cuando lo ejecutes. No fue ejecutado en este entorno; sus resultados son todavía desconocidos.

## Controles de seguridad pendientes
- Un análisis antivirus independiente del paquete exacto.
- Prueba Android real en 26, 33 y 36: navegación, export/import, borrado de datos y estado offline.
- Revisar la compatibilidad de WebView, permisos, `FileProvider` y los banners de privacidad.
- Comprobar el flujo de actualización y copia de seguridad antes de cambiar versiones.
- Comprobar que Android 16 no oculte contenido bajo barras del sistema (edge-to-edge).

## Qué NO se modifica
No se cambia Cloudflare en producción, el Kit Pro, Pistacho, las verificaciones Google/Bing ni Cloudflare Analytics. Las fuentes Android V5.1 y sus JavaScript se conservan byte por byte.
