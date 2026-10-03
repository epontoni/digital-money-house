# Informe de Testing Exploratorio - Sprints 3 y 4

Este documento detalla el diseño, la metodología, las sesiones basadas en objetivos (**Session-Based Test Management - SBTM**), los tours heurísticos y los resultados del **testing exploratorio** realizado sobre las funcionalidades de la billetera virtual **Digital Money House (Sprints 3 y 4)**.

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

### Sesión 06: El Tour del Consumidor (Listado y Búsqueda de Servicios)
* **Charter:** Explorar la navegación de servicios disponibles sin paginar, corroborando la fluidez del scroll continuo y la reactividad del buscador por título.
* **Área Bajo Prueba:** `/services` (vista de catálogo).
* **Duración:** 45 minutos.
* **Escenarios y Workflows Ejecutados:**
  1. **Visualización sin paginar:** Se verificó que los servicios disponibles (MetroGAS, Edenor, Telecom, Cablevisión, AySA, Claro, Movistar, Naturgy) se exhiban en una única lista vertical y continua.
  2. **Búsqueda instantánea:**
     - Al escribir "Tele", la lista filtra en tiempo real mostrando "Telecom".
     - Al escribir un término inexistente (ej: "Netflix"), se muestra mensaje amigable de "No se encontraron servicios".
     - Al limpiar el buscador, la lista restituye la totalidad de servicios inmediatamente.
* **Resultado:** **Aprobado**. Interacción intuitiva y sin recargas de página.

---

### Sesión 07: El Tour de la Validación Crítica (Cuentas y Regla de 11 dígitos)
* **Charter:** Poner a prueba la validación del número de cuenta de servicio, la regla de 11 dígitos sin comenzar en 2, y la transición hacia la selección de medios de pago.
* **Área Bajo Prueba:** `/services` (paso `account_number`).
* **Duración:** 40 minutos.
* **Escenarios y Workflows Ejecutados:**
  1. **Longitudes inválidas:**
     - Ingreso de 5 o 10 dígitos: El botón "Continuar" permanece inactivo o el sistema muestra advertencia de longitud requerida.
  2. **Regla de negocio (comienza en 2):**
     - Ingreso de cuenta `27289701912` (11 dígitos, comienza con '2'): El sistema redirige a la pantalla de error "No encontramos facturas asociadas a este dato", idéntica a `error número de cuenta.jpg`.
  3. **Cuentas de prueba con facturas pendientes:**
     - Ingreso de `37289701912` (11 dígitos, no empieza con 2): El sistema avanza exitosamente a la pantalla de selección de medio de pago con el importe adeudado.
* **Resultado:** **Aprobado**. Las reglas de negocio operan con total solidez.

---

### Sesión 08: El Tour del Dinero y Medios de Pago (Pago de Servicios)
* **Charter:** Explorar las opciones de pago mediante Dinero en Cuenta y Tarjetas de débito/crédito, así como el alta rápida de tarjetas desde el flujo de pago.
* **Área Bajo Prueba:** `/services` (paso `payment_method` y modal nueva tarjeta).
* **Duración:** 50 minutos.
* **Escenarios y Workflows Ejecutados:**
  1. **Disponibilidad de métodos:** Se verificó que la pantalla liste "Dinero en cuenta" con su saldo disponible, seguido de cada una de las tarjetas adheridas del usuario.
  2. **Alta de nueva tarjeta:**
     - Clic en "Nueva tarjeta (+)": Abre el formulario modal / acceso directo para ingresar número, vencimiento y titular.
     - Tras completar la carga, la nueva tarjeta aparece seleccionable en el listado.
  3. **Pago con dinero en cuenta:**
     - Selección de opción "Dinero en cuenta".
     - Presionar botón "Pagar".
     - El balance se descuenta por el importe exacto y se registra la actividad de egreso (`service_payment`).
* **Resultado:** **Aprobado**.

---

### Sesión 09: El Tour del Escéptico (Insuficiencia de Fondos y Comprobante PDF)
* **Charter:** Forzar escenarios de error por saldo insuficiente y validar la pantalla de error específica, además de comprobar la descarga del voucher en formato PDF.
* **Área Bajo Prueba:** `/services` (pasos `payment_error` y `payment_success`).
* **Duración:** 45 minutos.
* **Escenarios y Workflows Ejecutados:**
  1. **Insuficiencia de fondos:**
     - Seleccionar una factura cuyo importe supere el saldo actual de la cuenta.
     - Presionar "Pagar".
     - El backend responde con estado HTTP 402 y el frontend renderiza la pantalla de error: *"Hubo un problema con tu pago. Puede deberse a fondos insuficientes..."* con botón de reintento.
  2. **Comprobante formal y exportación PDF:**
     - Al completar un pago exitoso, la pantalla muestra el banner verde *"Ya realizaste tu pago"*, fecha, importe, servicio y tarjeta/cuenta utilizada.
     - Presionar *"Descargar comprobante"*: Despliega el modal de comprobante con estilos de impresión aislados listos para exportar a PDF sin elementos de menú ni botones sobrantes.
* **Resultado:** **Aprobado**. Experiencia de usuario consistente con las capturas de diseño de Figma.

---

### Sesión 10: El Tour de la Infraestructura (Docker & Contenedores)
* **Charter:** Verificar la construcción y ejecución del proyecto contenerizado mediante Dockerfile multi-etapa y Docker Compose.
* **Área Bajo Prueba:** `Dockerfile` y `docker-compose.yml`.
* **Duración:** 35 minutos.
* **Escenarios y Workflows Ejecutados:**
  1. **Estructura Multi-Stage:** Se verificaron las 3 etapas (`deps`, `builder`, `runner`) asegurando una imagen liviana basada en `node:20-alpine`.
  2. **Variables y Persistencia:** Se configuró el montaje de volumen para `db.json` asegurando la persistencia de las transacciones generadas en la aplicación.
  3. **Healthcheck y Port Binding:** Exposición estándar en puerto `3000:3000` con sondeo continuo a `/api/health`.
* **Resultado:** **Aprobado**. Listo para despliegue productivo en AWS ECS/EC2.

---

## 3. Matriz de Cobertura y Conclusiones Consolidadas (Sprints 1 al 4)

| Módulo Exploratorio | Charters Ejecutados | Nivel de Estabilidad | Observaciones |
| :--- | :---: | :---: | :--- |
| **Ingreso por Tarjeta y Carga Externa** | 2 | Alta | Flujos validados con revisión, copiado de CVU/Alias y persistencia de balance. |
| **Paginación & Filtros de Actividad** | 1 | Alta | Paginación cada 10 transacciones y filtros combinados funcionando al 100%. |
| **Detalle de Actividad y Comprobantes** | 1 | Alta | Renderizado dinámico y exportación a PDF. |
| **Catálogo de Servicios sin Paginar** | 1 | Alta | Búsqueda reactiva por título y catálogo continuo. |
| **Validación de Cuenta (11 dígitos)** | 1 | Alta | Regla de descarte de inicial '2' y control de formato estricto. |
| **Pago con Saldo / Tarjetas** | 1 | Alta | Selección dinámica, creación de tarjetas y actualización de balance. |
| **Manejo de Errores e Insuficiencia de Fondos** | 1 | Alta | Pantallas de error dedicadas y tolerantes a fallos. |
| **Infraestructura Docker** | 1 | Alta | Dockerfile multi-stage y Docker Compose listos para AWS. |
| **Diseño Responsive Global** | 1 | Alta | Ajuste fluido en Desktop, Tablet y Mobile. |

### Conclusión General:
El proyecto **Digital Money House** ha superado de forma integral y exitosa la totalidad de las pruebas exploratorias, funcionales y de calidad estipuladas en los Sprints 1, 2, 3 y 4. Las aplicaciones de frontend y backend se encuentran completamente estabilizadas, documentadas y listas para su pase a producción.

