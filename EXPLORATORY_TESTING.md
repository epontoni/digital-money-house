# Informe de Testing Exploratorio - Sprint 3

Este documento detalla el diseño, la metodología, las sesiones basadas en objetivos (**Session-Based Test Management - SBTM**), los tours heurísticos y los resultados del **testing exploratorio** realizado sobre las nuevas funcionalidades de la billetera virtual **Digital Money House (Sprint 3)**.

---

## 1. Estrategia y Metodología de Organización

El testing exploratorio se estructuró siguiendo el marco de **Session-Based Test Management (SBTM)** y la técnica de **Tours Heurísticos de James Whittaker**, orientados a descubrir comportamientos imprevistos, inconsistencias de usabilidad y validar la robustez de los flujos troncales.

### Estructura de cada Sesión de Pruebas:
- **Charter (Misión):** Objetivo específico de investigación y alcance de la sesión.
- **Timebox:** Duración fija de 45 a 60 minutos sin interrupciones.
- **Estrategia / Tour Heurístico:** Técnica aplicada (Tour del Dinero, Tour del Escéptico, Tour de los Límites, Tour de Variabilidad).
- **Notas y Hallazgos:** Observaciones cualitativas, comportamientos observados y anomalías detectadas.
- **Evaluación de Riesgo:** Nivel de estabilidad del módulo explorado.

---

## 2. Registro de Sesiones Exploratorias (Charters)

### Sesión 01: El Tour del Dinero (Flujo de Carga con Tarjeta)
* **Charter:** Explorar el flujo completo de "Cargar dinero con tarjeta de crédito/débito", validando la selección de medios adheridos, el comportamiento con valores extremos o inválidos y la consistencia en el balance final.
* **Área Bajo Prueba:** `/deposit` (pasos: `select_card`, `input_amount`, `review`, `success`).
* **Duración:** 45 minutos.
* **Escenarios y Workflows Ejecutados:**
  1. **Selección de tarjetas:** Se verificó la selección de diferentes tarjetas registradas (Visa, Mastercard, AMEX) mediante los selectores radio.
  2. **Valores límite en el monto:**
     - Ingreso de `$0`: El botón "Continuar" permanece deshabilitado en gris, previniendo el avance.
     - Ingreso de valores decimales (ej: `$350.75`): El sistema acepta centavos y realiza el cómputo exacto.
     - Intentos de valores negativos: El campo numérico sanitiza caracteres no válidos.
  3. **Corrección sobre la marcha (Pantalla de revisión):**
     - En "Revisá que está todo bien", se presionó el ícono de lápiz en "Vas a transferir". El sistema regresó al paso anterior preservando el monto previo para su edición.
  4. **Impacto en cuenta:** Al confirmar la carga, el saldo del usuario se incrementó de forma inmediata y se generó el registro en la lista de actividad con tipo `deposit`.
* **Resultado:** **Aprobado**. El flujo responde con fluidez y mantiene sincronizada la sesión del usuario.

---

### Sesión 02: El Tour del Intercambio (Carga vía Cuenta Externa)
* **Charter:** Explorar la consulta y copiado de credenciales bancarias (CVU y Alias) destinadas a transferencias entrantes desde cuentas externas.
* **Área Bajo Prueba:** `/deposit` (opción `external_transfer`).
* **Duración:** 30 minutos.
* **Escenarios y Workflows Ejecutados:**
  1. **Visualización de datos:** Se corroboró que el CVU de 22 dígitos y el Alias asignado al usuario en sesión se carguen correctamente.
  2. **Comportamiento del portapapeles:**
     - Clic en el botón de copiar de CVU: Se verificó mediante pegado en una aplicación externa (bloc de notas) que el número copiado coincide exactamente.
     - Clic en copiar Alias: Feedback visual con mensaje "¡Copiado!" durante 2.5 segundos.
  3. **Navegación de retorno:** El botón de "Volver a métodos de carga" restituye la vista principal sin recargar la página.
* **Resultado:** **Aprobado**. Excelente retroalimentación al usuario y copiado confiable.

---

### Sesión 03: El Tour de la Complejidad (Actividad, Paginación y Filtros Combinados)
* **Charter:** Evaluar el rendimiento, la paginación y la interacción entre el buscador por palabras clave y los filtros avanzados de período, operación y montos aproximados.
* **Área Bajo Prueba:** `/activity`.
* **Duración:** 60 minutos.
* **Escenarios y Workflows Ejecutados:**
  1. **Paginación estricta:** Con más de 20 movimientos generados, la interfaz divide en páginas de exactamente 10 transacciones. La navegación entre las páginas 1, 2 y 3 actualiza la lista instantáneamente.
  2. **Búsqueda por palabras clave:**
     - Búsqueda "Rodrigo": Filtra únicamente las transferencias vinculadas a dicho nombre.
     - Búsqueda "Edenor": Trae pagos de servicios correspondientes.
  3. **Filtros combinados:**
     - Período: Selección de "Último mes" + Operación "Egresos".
     - Monto aproximado: Selección del rango "$1000 a $5000".
     - Se verificó que la intersección de filtros sea precisa.
  4. **Restablecimiento ("Borrar filtros"):** El botón limpia todos los criterios aplicados y restaura la paginación en la página 1 con la totalidad de movimientos.
* **Resultado:** **Aprobado**. La reactividad del popover de filtros y las etiquetas de filtros activos brindan una experiencia de usuario clara.

---

### Sesión 04: El Tour Forense (Detalle de Transacción y Comprobantes)
* **Charter:** Inspeccionar la exactitud de los metadatos de cada movimiento (`/activity/[id]`) y la integridad del comprobante descargable / imprimible.
* **Área Bajo Prueba:** `/activity/[id]` y modal de comprobante (`VoucherModal`).
* **Duración:** 45 minutos.
* **Escenarios y Workflows Ejecutados:**
  1. **Transición desde la lista:** Clic en cualquier fila de actividad redirige limpiamente a la URL dinámica con el ID de la transacción.
  2. **Consistencia de datos:**
     - Número de operación único presente (ej: `27903047281`).
     - Estado visible "✓ Aprobada" en verde lima.
     - Destinatario / Origen y fecha en formato extendido en español.
  3. **Modal de comprobante:**
     - Clic en "Descargar comprobante" abre la plantilla visual que replica fielmente el diseño de Figma (`Comprobante de transferencia.jpg`).
     - Activación de impresión nativa (`window.print()`) con reglas de estilo de impresión para exportar a PDF sin elementos sobrantes de la UI.
* **Resultado:** **Aprobado**. Presentación fidedigna al diseño de referencia.

---

### Sesión 05: El Tour de los Dispositivos (Responsividad y Accesibilidad Heurística)
* **Charter:** Explorar la usabilidad de las pantallas desarrolladas en resoluciones Desktop (1920x1080), Tablet (iPad 768x1024) y Mobile (iPhone 375x812).
* **Área Bajo Prueba:** Global en rutas de Sprint 3.
* **Duración:** 45 minutos.
* **Escenarios y Workflows Ejecutados:**
  1. **Mobile (375px):**
     - El menú lateral se repliega en un drawer accesible mediante el botón de menú hamburguesa.
     - Las opciones de carga de saldo y la paginación se adaptan en columnas apiladas sin desbordamiento horizontal.
     - El modal de comprobante escala adecuadamente ocupando el ancho del dispositivo móvil.
  2. **Tablet (768px):**
     - Barra lateral visible en el lateral izquierdo según la referencia de `Capturas FRONT END - S3/Tablet`.
     - Distribución equilibrada entre el panel lateral y el área de contenido.
* **Resultado:** **Aprobado**.

---

## 3. Matriz de Cobertura y Conclusiones del Sprint 3

| Módulo Exploratorio | Charters Ejecutados | Nivel de Estabilidad | Observaciones |
| :--- | :---: | :---: | :--- |
| **Ingreso por Tarjeta** | 1 | Alta | Flujo validado en 4 pasos con revisión y persistencia de balance. |
| **Ingreso por Cuenta Externa** | 1 | Alta | Copiado rápido de CVU y Alias con feedback visual. |
| **Paginación & Filtros** | 1 | Alta | Paginación cada 10 transacciones y filtros combinados funcionando al 100%. |
| **Detalle de Actividad** | 1 | Alta | Renderizado dinámico y generación de comprobante listo para PDF. |
| **Diseño Responsive** | 1 | Alta | Ajuste fluido en Desktop, Tablet y Mobile. |

### Conclusión General:
Las funcionalidades del Sprint 3 cumplen con todos los criterios de aceptación y especificaciones del PDF. El sistema demuestra solidez, buena tolerancia a entradas erróneas del usuario y un apego estricto a las referencias visuales de Figma.
