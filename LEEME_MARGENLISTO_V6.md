# MargenListo V6.0 — Beta Android independiente

**Estado:** código fuente completo, pruebas de lógica e interfaz locales aprobadas. **No contiene un APK V6.0 compilado ni una app publicada.**

## Qué cambia frente a V5.7

- **Productos más rentables:** agrupación por nombre ignorando mayúsculas, máximo 5 productos. Ordenados por ganancia variable total. No se venden ni comparten datos.
- **Canales más rentables:** agrupa ganancias variables por canal y respeta los filtros mes/canal de la pantalla principal.
- **Repetir venta:** precompleta el formulario con el producto, cantidad y costos anteriores; usa la fecha de hoy y **no guarda automáticamente**. Se debe revisar y confirmar.
- **V6 beta como aplicación separada:** la variante Android *debug* agrega el sufijo `.preview`: `app.margenlisto.mobile.preview` con nombre **MargenListo Beta**. No sustituye la V5.7 `app.margenlisto.mobile` ya instalada.
- **Control de permisos renovado:** `scripts/verify-permissions.py` permite solo el permiso interno de AndroidX con el identificador de la beta (o ningún permiso); falla si hay permisos nuevos. No se agregan permisos de red, cámara ni contactos.
- **Fuentes probadas sin Internet:** `app/src/main/assets` permanece autocontenida.

## Tus datos y las versiones

La V5.7 y la V6.0 Beta almacenan datos **separados** porque Android las considera apps diferentes. **No desinstales V5.7 ni borres sus datos.** Para trasladar tus ventas:

1. Abrí **V5.7 → Registro de ventas → Respaldo JSON** y guardá el archivo en un lugar seguro.
2. Después de instalar V6 Beta, abrí **Registro de ventas → Importar respaldo JSON** y elegí ese archivo.
3. Confirmá que la cantidad de registros coincida y que las ganancias sean razonables.
4. Para probar, empezá con datos ficticios.

La importación reemplaza el historial que hubiese en la Beta. Nunca subas tus respaldos financieros a un repositorio público.

## Cómo compilar con GitHub Actions

- Subí los archivos de este proyecto a la **raíz** del repositorio `MargenListo`, conservando las rutas `app`, `scripts`, `tests`.
- La carpeta `.github` puede no cargarse mediante arrastrar/soltar. Abrí el archivo existente `.github/workflows/android-debug.yml` en GitHub y reemplazá todo su contenido por el archivo V6 incluido.
- Ejecutá desde **Actions → MargenListo V6.0 - APK Beta independiente → Run workflow** en rama `main`. **No uses Re-run jobs** de V5.7.
- Si se completa, bajá el artefacto `MargenListo-V6.0-APK-DEBUG-Preview`, comprobá el SHA-256 y la firma, luego escanealo antes de instalar.

Un fallo en GitHub Actions **no significa automáticamente** que sea peligroso: hay que leer el error concreto. No eludas un aviso del antivirus ni desactives Samsung Auto Blocker o Play Protect para forzar una instalación.

## Todavía pendiente

- Primera compilación V6 real con SDK/Gradle, verificación final del APK y prueba en Android.
- Escaneo antivirus externo e inspección de dependencias.
- Accesibilidad y compatibilidad en distintos dispositivos Android.
- Crear una firma estable de lanzamiento y generar `.aab` con claves de carga seguras para Google Play.
- Política de privacidad pública y formulario de Seguridad de los datos; tester cerrados si aplica.
- Medición de retención con consentimiento y eventual diseño de monetización respetuoso.

**Nunca subas a GitHub una clave privada de firma, contraseñas, exportaciones de ventas, archivos `.jks` ni secretos.**
