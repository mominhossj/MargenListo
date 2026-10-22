# Pasos para reemplazar el código del repositorio MargenListo con V6

El repositorio existente **no debe borrarse**. Este cambio modifica únicamente el proyecto de desarrollo en GitHub; **no afecta el sitio de Cloudflare ni la app V5.7 instalada**.

## Ruta sencilla (navegador de PC)

1. Descargar `MargenListo_V6_SOLO_CAMBIOS.zip` y descomprimirlo. Contiene únicamente cambios de código y pruebas (no redistribuye `app.js`).
2. Abrir la pestaña **Code** de tu repositorio `MargenListo` en la rama `main`.
3. **Add file → Upload files**: arrastrar los archivos/carpetas *dentro* de la carpeta descomprimida. Confirmar que aparecen las rutas `app/build.gradle`, `app/src/main/...`, `scripts`, `tests` directamente en la raíz de GitHub (sin carpeta intermedia). Confirmar los reemplazos de archivos.
4. La carpeta oculta `.github` no siempre se sube por navegador. Abrir directamente `.github/workflows/android-debug.yml` en GitHub y **pegar el contenido COMPLETO del archivo standalone `MargenListo_V6_android-debug.yml`**. Guardar con Commit changes en `main`.
5. En Actions aparecerá el nuevo nombre **MargenListo V6.0 - APK Beta independiente**. **Run workflow → main → Run workflow**, nueva ejecución, no `Re-run jobs` de una anterior.
6. Al finalizar con verde, buscar en `Artifacts` `MargenListo-V6.0-APK-DEBUG-Preview`. Descargar, escanear y comprobar el APK antes de instalar. No desactivar el Bloqueador automático para forzar una instalación señalada como peligrosa.

Si el navegador no conserva las rutas de subcarpetas al arrastrarlas, usar GitHub Desktop o el editor de Github para archivos individuales. No subir el ZIP como un único archivo al repositorio.

## Datos y apps

La V6 Debug se instala como **MargenListo Beta** (`app.margenlisto.mobile.preview`), junto a V5.7 (`app.margenlisto.mobile`). Para importar ventas, hacé primero el **Respaldo JSON** en V5.7 y después importalo en V6 Beta. No desinstales la versión actual mientras probamos.

## Límites actuales

Este ZIP no contiene APK V6 firmado. Se verificaron fuentes y prueba de navegador; la compilación real Android se hace en GitHub. Tampoco contiene publicidad ni capacidad de registrar ingresos por anuncios. La firma debug de GitHub no sirve para Google Play y puede cambiar entre ejecuciones.
