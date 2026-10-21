# MargenListo V5.7 — Constructor de APK DEBUG

Este paquete contiene **fuentes Android**, no un APK precompilado. No cambian los archivos de las calculadoras respecto de V5.7. **La compilación Android y el antivirus independiente siguen pendientes** hasta ejecutar las herramientas en un entorno que disponga del SDK.

## Opción A — GitHub Actions

1. Crear un repositorio **privado** vacío para MargenListo en GitHub (de ser posible, mantener privados los archivos originales).
2. Descomprimir el ZIP y subir **su contenido** a la raíz del repositorio; incluir el directorio oculto `.github/workflows`.
3. Abrir **Actions → MargenListo V5.7 - Crear y verificar APK debug → Run workflow**.
4. Si el job termina en verde, abrir el resultado y descargar el artefacto `MargenListo-V5.7-APK-DEBUG-NoPublicar`.
5. Extraer `app-debug.apk` de ese artefacto. Primero analizarlo con antivirus, revisar el SHA-256 y solamente entonces probar en un Android propio.

La automatización instala SDK API 36, Gradle 8.13 y JDK 17, ejecuta pruebas, compila, verifica firma de depuración, identifica el paquete Android, comprueba `minSdk/targetSdk` y que el APK no haya adquirido permisos no autorizados. **No es una certificación de seguridad.**

## Opción B — Windows con Android Studio

1. Instalar JDK 17 y Android Studio, y desde SDK Manager instalar **Android API 36** y **Build Tools 35.0.0**.
2. Abrir PowerShell en la carpeta del proyecto.
3. Ejecutar: `powershell -ExecutionPolicy RemoteSigned -File .\scripts\compilar-en-windows.ps1`. Si la política de tu equipo bloquea la ejecución, **no deshabilites protecciones**; abrí y revisá el script antes de autorizarlo por los mecanismos normales de Windows.
4. Si termina correctamente, el APK está en `app\build\outputs\apk\debug\app-debug.apk`.

El script obtiene Gradle **solo del dominio oficial** y comprueba su SHA-256 antes de descomprimirlo. No instala APK en tu celular ni modifica los datos de la web pública.

## ¿Por qué DEBUG?

La firma de depuración sirve para pruebas locales. Para Google Play habrá que generar un **AAB release** con clave privada, revisar políticas de privacidad y publicación y probar en dispositivos reales. No publiques ni distribuyas un APK debug como lanzamiento comercial.

## Precauciones

- No desactivar Windows Defender para descargar o ejecutar archivos.
- No cargar datos reales sensibles hasta completar pruebas y revisar respaldos.
- No se probó la instalación real ni el flujo de importación con Android WebView físico.
- No se tocó Cloudflare ni Pistacho.
