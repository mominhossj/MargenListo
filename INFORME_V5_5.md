# MargenListo Android V5.5 — continuación del desarrollo

**Estado: código fuente de prueba. No es APK ni AAB, ni una aplicación lista para Google Play.**
Fecha de trabajo: 21 de octubre de 2026.

## Qué cambió frente a V5.4

Se conservó el enrutador offline que entrega el `index.html` correcto para todas las guías, calculadoras y el registro de ventas. La mejora de V5.5 resuelve una falla de importación: el selector nativo devolvía una URL `content://` al WebView que tenía `setAllowContentAccess(false)`, de modo que no estaba garantizada la lectura del archivo seleccionado.

El flujo nuevo usa `ACTION_OPEN_DOCUMENT`, sin permisos de acceso general al almacenamiento. Android lee el archivo que la persona eligió (hasta **750.000 bytes**) en un hilo de trabajo, comprueba codificación UTF-8, escapa su contenido como cadena JavaScript y lo entrega a la pantalla local de `registro-ventas`. El código JavaScript valida la estructura del respaldo antes de reemplazar registros, pide confirmación al usuario y recupera el historial anterior si falla el guardado. Se preserva la importación web normal por `<input type=file>`.

El motor de ventas, los cálculos, las funciones sin conexión y las integraciones de Google/Bing en el sitio **no fueron modificados**. La app Android beta sigue sin permiso `INTERNET`, publicidad o pasarela de pago integrada.

## Pruebas ejecutadas en este entorno

| Control | Resultado |
|---|---:|
| Motor matemático / validación (`node tests/ledger-core.spec.js`) | 49 aprobadas |
| Flujo JavaScript de importación (`node tests/ledger-import.spec.js`) | 6 comprobaciones |
| Lectura estricta de JSON con Java real (`BackupJsonReaderTest`) | 10 aprobadas |
| Resolución de rutas offline con Java real (`OfflineRoutesTest`) | 20 aprobadas |
| Referencias HTML/CSS a recursos empaquetados | 76 comprobadas |
| Estructura de Android, permisos y XML | 9 controles |
| Configuración estática de API 36 | 9 controles |
| Restricciones del selector nativo (estático) | 13 controles |
| Sintaxis de JavaScript | Sin errores en archivos comprobados |
| Estructura de ZIP / hashes | Verificada |

Los grupos de prueba anteriores son distintos tipos de control y **no equivalen a una certificación integral de seguridad**. La lectura Java y el cálculo se ejecutaron de verdad; no se ejecutó el SDK de Android.

## Pruebas pendientes, indispensables

1. Compilación `:app:assembleDebug` usando Android SDK 36, Gradle 8.13 y JDK 17 en Android Studio o GitHub Actions.
2. Ejecución en Android real o emulador: navegación offline, importar JSON desde Files/Drive, exportar CSV y JSON, teclado, gestos, rotación y cambios de tamaño.
3. Revisión antivirus independiente **del APK final**, análisis dinámico y revisión manual de dependencias.
4. Política de privacidad definitiva, capturas reales de dispositivo, AAB release firmado y pruebas exigidas por Google Play.
5. Una vez estabilizado el producto, estudio de retención y monetización. **Google Play no paga por cada descarga de una app gratuita.**

## Seguridad y tratamiento de alertas

Ningún archivo debe marcarse como seguro al 100%. Defender había bloqueado ZIP anteriores de MargenListo. Si vuelve a bloquear este paquete, **no se debe desactivar Defender, restaurar el archivo ni añadir excepciones**. Registrar el nombre de la detección y analizar el caso antes de seguir.

## Cómo compilar

El flujo `.github/workflows/android-debug.yml` utiliza versiones documentadas de las acciones `android-actions/setup-android@v4` y `gradle/actions/setup-gradle@v6`. Subir los contenidos completos a un repositorio **privado** permite iniciar `workflow_dispatch`; el paso final produce un APK de depuración como artefacto solo si la compilación es exitosa. No se ha ejecutado aquí por falta de SDK/Gradle y por no existir un repositorio MargenListo conectado a GitHub.

No actualizar el proyecto de Cloudflare ni poner a la venta esta versión de Android con el presente ZIP.
