# MargenListo V6 — Plan comercial y de publicación (22 de octubre de 2026)

## Producto que vamos a posicionar

**MargenListo — Calculá precios, registrá ventas y descubrí cuánto ganás.**

Público inicial: microemprendedores argentinos que venden desde Instagram, WhatsApp, ferias y marketplaces; no quieren aprender un sistema ERP ni pagar una suscripción antes de ver utilidad.

Tres problemas recurrentes que sí resolvemos parcialmente: (1) ¿Cobré lo suficiente después de descuentos y comisiones? (2) ¿Qué producto y canal me dejan más ganancia variable? (3) ¿Cuánto gané en el mes, usando mis ventas realmente registradas?

Competencia e influencias: herramientas gratuitas de Tiendanube y Shopify para precios/margen; plataformas administrativas de mayor alcance como Alegra o Contabilium; apps simples de registro de ventas. Aprender de su claridad, demostraciones y automatización sin copiar diseños, marcas, textos ni código. Nuestra ventaja **hipotética** a validar: offline, privada, centrada en ARS, sin registro y con poca fricción. No afirmamos superioridad sin estudios con usuarios reales.

## Modelo de negocio recomendado por etapas

**Fase 1: retención antes que anuncios.** Mantener cálculos y registro de ventas gratuitos; sin publicidad ni telemetría invasiva durante pruebas. Conseguir 20–50 usuarios reales con consentimiento y medir (por feedback voluntario) el uso una semana después. No hay evidencia aún de usuarios recurrentes fuera del teléfono de pruebas.

**Fase 2: publicidad transparente y discreta.** Después de demostrar uso repetido, evaluar un banner o anuncio nativo correctamente etiquetado en pantallas secundarias. Sin intersticial al guardar ventas, sin anuncios forzados, sin clics incentivados ni tráfico artificial. Requiere añadir Internet/SDK, revisar permisos, consentimiento aplicable y documentación de datos; por lo tanto NO está implementado en esta beta offline. Nunca se cobra automáticamente por una instalación gratuita.

**Fase 3: Pro por productividad, no solo Excel.** Lista de productos reutilizables, gastos fijos mensuales, reportes comparativos y respaldo entre dispositivos (solo con arquitectura segura), exportaciones PDF y alarmas opcionales de márgenes negativos. La venta debe resolver una tarea recurrente; el Excel pasaría a ser extra, no propuesta central. Cualquier producto digital vendido dentro de Play debe revisarse frente a las reglas de facturación de la tienda antes de agregar checkout.

## Economía de anuncios: ilustración, NO pronóstico

Ingresos estimados = impresiones válidas / 1000 × eCPM real (USD). Las impresiones dependen de usuarios activos, visitas a pantallas, porcentaje de llenado y frecuencia permitida. No se pagan simplemente las descargas.

| Impresiones válidas/mes | eCPM hipotético USD 0,50 | eCPM hipotético USD 1,50 | eCPM hipotético USD 3,00 |
|---:|---:|---:|---:|
| 5.000 | USD 2,50 | USD 7,50 | USD 15 |
| 20.000 | USD 10 | USD 30 | USD 60 |
| 100.000 | USD 50 | USD 150 | USD 300 |

No hay datos propios de eCPM, retención, DAU ni costos de adquisición: estas cifras son *escenarios matemáticos* brutos, no estimaciones de ingresos reales para MargenListo.

## Posicionamiento orgánico de bajo presupuesto

1. Mejorar páginas útiles de la web existente con ejemplos reales de cálculos (ficticios y explicados) que resuelvan preguntas específicas: “precio de venta con comisión”, “cuánto gano vendiendo por Instagram”, “diferencia entre margen y recargo”. No crear decenas de páginas casi iguales.
2. Incluir llamadas suaves desde las calculadoras de la web al registro de ventas gratuito, pero solo cuando haya una versión pública probada; separar claramente la web de la beta Android.
3. Publicar una demostración vertical de 20–35 segundos con captura real del uso, sin promesas de dinero: costos → cobrado → ganancia. Otra demostración: producto con pérdida y corrección de precio. No depender de un canal dedicado puramente publicitario.
4. Capturas de la app que muestren una acción relevante: guardar venta, filtrar mes, comparar canales, repetir venta. Nada de logos que se hagan pasar por otros productos.
5. Evitar campañas pagas hasta conocer activación y retención. Registrar manualmente: instalaciones voluntarias, gente que completó una venta, personas que repiten el uso, informes de errores.

## Lista de publicación en Google Play

- **AAB release** (no APK Debug), ID definitivo `app.margenlisto.mobile`, target API 36, firma de carga estable protegida; Play App Signing.
- Política de privacidad accesible públicamente y dentro de la app, con responsable y contacto reales (no inventados); sección Seguridad de los datos congruente con SDKs y transmisión.
- Comprobar que no hay enlaces a pagos externos por contenidos digitales desde la versión Play sin fundamento regulatorio/permiso de política.
- Cumplir con pruebas cerradas de 12 participantes por 14 días para cuentas personales nuevas cuando aplique; preparar ficha, capturas genuinas y declaraciones requeridas.
- Control de calidad: accesibilidad, backup/restauración, rotación de pantalla, errores Android, revisión de dependencias, Play Protect y dispositivos reales.
- Presupuesto: tarifa de alta de cuenta Play Console si corresponde, costos fiscales/contables y posibles servicios; nada de gastos asumidos o realizados.

## Qué mediremos antes de monetizar

- **Activación:** proporción de usuarios voluntarios que registra al menos una venta.
- **Retención D7:** proporción de usuarios que vuelve dentro de 7 días (solo medición consentida, o feedback voluntario mientras sea offline).
- **Valor:** cuántas veces se utiliza “repetir venta” y el panel por producto/canal (sin vigilancia de datos financieros).
- **Confianza:** reportes de error, pérdida de datos y opiniones de usuarios; antes de dinero, cero pérdidas de registros.

## Fuentes oficiales consultadas

- API objetivo Google Play: https://developer.android.com/google/play/requirements/target-sdk
- Pruebas cerradas cuentas personales nuevas: https://support.google.com/googleplay/android-developer/answer/14151465
- Firma y Play App Signing: https://developer.android.com/studio/publish/app-signing
- Datos y privacidad: https://support.google.com/googleplay/android-developer/answer/16543315
- Métricas publicitarias AdMob: https://developers.google.com/admob/api/v1/report-metrics-dimensions

Estas fuentes contienen reglas que pueden cambiar antes de la publicación. Volver a verificar al iniciar el alta en Play Console.
