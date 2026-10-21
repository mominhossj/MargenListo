# Informe de pruebas V5.7 (21 octubre 2026)

## Resultados ejecutados
- `tests/ledger-core.spec.js`: 49 pruebas existentes, OK.
- `tests/financial-precision.spec.js`: 50.000 operaciones aleatorias y regresión de redondeo, OK.
- `tests/reporting.spec.js`: 20 pruebas de filtros, evolución mensual, CSV filtrado, preservación y formatos, OK.
- `tests/data_integrity.spec.js`: 9 aserciones sobre protección de historial corrupto e importación reparadora, OK.
- `tests/ledger-import.spec.js`: 6 comprobaciones sobre respaldo e importación, OK.
- `tests/reporting_browser.py`: Chromium en 390 px y 1280 px, guardado, filtros, resumen mensual, descarga CSV filtrado y respaldo JSON, sin errores de JS; OK.
- Revisiones de rutas, permisos, recursos, sintaxis XML y scripts: controles estáticos, no sustituyen pruebas en Android.

## Limitaciones explícitas
- Sin Android SDK/Gradle locales: imposible certificar `assembleDebug` o producir APK aquí.
- Sin repositorio GitHub accesible para MargenListo: flujo Actions preparado pero NO ejecutado.
- Navegación offline real Android/instalación PWA no comprobadas en teléfono.
- Sin escaneo externo de malware: la revisión estática NO garantiza ausencia de amenazas.
- El navegador de prueba utiliza HTML/JS/CSS reales cargados en contexto aislado; su CSP se retira SOLO en el documento del test para permitir inyección del código. No se altera el CSP de los entregables.
- Precisión y seguridad del motor de cálculos: pruebas no equivalen a certificación financiera o de protección de datos.

## Integridad de producto
- El backend matemático `calc.js`, el JavaScript base `app.js`, los logos y el manifest Android mantienen sus bytes V5.6 (excepto archivos listados en el delta).
- `ledger-core.js` conserva aritmética en centavos enteros e incorpora funciones de filtros y grupos mensuales.
- `ledger.js` conserva clave localStorage `margenlisto_ventas_v1` y formato de respaldo `MargenListoLedger` versión 1.
- Historial bloqueado en lectura si hay registros inválidos o IDs duplicados (sin sobrescribir), hasta importar un respaldo válido confirmado.
