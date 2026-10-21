# Nota V5.6

Leé primero `LEEME_V5_6.md`.

# MargenListo Android V5.5 — Proyecto fuente / Beta

**NO contiene APK ni AAB. No está publicado ni certificado por un antivirus.**

## Qué mejoró
- Corregida navegación de `/registro-ventas/`, guías y raíz en WebView offline: rutas traducidas a `index.html`.
- Rechazo explícito de rutas desconocidas o con secuencias sospechosas: no hay fallback de red.
- Agregados tests con Java real de la resolución de rutas (sin Android SDK).
- Navegación Atrás en Android 13–16 (OnBackInvokedCallback; alternativa legacy).
- Área segura frente a barra de estado, navegación y recortes (WindowInsetsCompat con cero a WebView).
- Conserva el WebView sin permiso de INTERNET, con recursos locales y sin SDK de anuncios.
- Conserva la calculadora y el registro de ventas del proyecto anterior.
- Configuración de CI para generar un APK **debug** en GitHub Actions, sin subir claves privadas.

## Construir sin compartir contraseñas ni claves de firma
1. Abrí esta carpeta (contiene `settings.gradle`) desde **Android Studio** actualizado.
2. Instalá JDK 17, Android SDK Platform 36 y Build Tools 35.0.0; sincronizá Gradle.
3. Ejecutá `Build > Make Project` y `Build > Build APK(s)` para un APK de prueba.
4. Como alternativa, subí esta carpeta a un repositorio GitHub **privado** creado por vos y usá `Actions > MargenListo Android - Compilacion beta (manual) > Run workflow`. El workflow genera un artefacto de prueba si pasa los controles y Gradle compila.
5. **No publiques ni vendas un APK debug.** Para Google Play necesitás AAB firmado, pruebas de dispositivos y cumplimiento de políticas.

## Verificaciones reproducibles antes de compilar
`node tests/ledger-core.spec.js`
`python tests/check_assets.py`
`python tests/check_api36.py`
`node --check app/src/main/assets/app.js`
`javac -d build/route-tests app/src/main/java/app/margenlisto/mobile/OfflineRouteResolver.java tests/OfflineRoutesTest.java && java -cp build/route-tests OfflineRoutesTest`

## Cambio V5.5
- El selector nativo permite importar JSON desde archivos elegidos por la persona sin habilitar `setAllowContentAccess(true)` en la WebView.
- El archivo se lee fuera del hilo principal con límite estricto de 750 KB, decodificación UTF-8 y validación final en el código JS.
- Se agregaron 10 pruebas reales del lector Java y 6 comprobaciones del flujo de importación JS.
- El proceso Android SDK todavía NO se compiló ni probó en un dispositivo.

## Pendientes obligatorios
- Compilar en Android SDK + Gradle real (no instalados en este entorno).
- Probar Android 8, 13 y 16 con navegación de gestos y teclado.
- Validar importación y exportación JSON desde selector de archivos y FileProvider.
- Análisis de seguridad independiente del **APK exacto** y revisión manual de permisos.
- Revisar publicación Google Play, privacidad y facturación.

**No reemplaza ni modifica `margenlisto.pages.dev`; Google/Bing/Pistacho/Analytics siguen como estaban.**
