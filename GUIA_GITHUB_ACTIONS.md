# Generar un APK de prueba, sin costo inicial obligatorio

**No es necesario subir APK ni crear claves de firma para compilar la beta.**

1. En GitHub creá un repositorio privado nuevo llamado, por ejemplo, `margenlisto-android-beta` (verificá cuotas y condiciones de GitHub Actions para repositorios privados antes de usarlo).
2. Cargá a la raíz de ese repositorio **el contenido descomprimido** de este ZIP. Debe quedar `settings.gradle` en la raíz y `.github/workflows/android-debug.yml` dentro del directorio `.github`.
3. En el repositorio abrí la pestaña **Actions** y habilitá las acciones si GitHub lo solicita. Elegí **MargenListo Android - Compilacion beta (manual)** y ejecutá **Run workflow** desde la rama principal.
4. Mirá los resultados de las pruebas y del paso `:app:assembleDebug`. Si falla, descargá el log o copiá únicamente el mensaje de error; no compartas credenciales ni claves.
5. Si el flujo termina bien, en **Artifacts** encontrarás `MargenListo-Android-DEBUG-NoDistribuir`. Descargá el artefacto, comprobá su hash y escanealo con Defender antes de instalarlo en un dispositivo de prueba.

**No es una publicación en Google Play.** Google Play exige AAB release firmado y condiciones propias de la cuenta. No distribuyas un APK de depuración al público.
