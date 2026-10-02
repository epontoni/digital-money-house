# Plan de Pruebas (Testing Kickoff, Manual Testing & Automation) - Sprints 1, 2 y 3

Este documento detalla la estrategia de aseguramiento de calidad (QA), el diseño de la suite de pruebas manuales, automatizadas y exploratorias para las funcionalidades de la billetera virtual **Digital Money House**, cubriendo los requerimientos de **Sprint 1**, **Sprint 2** y **Sprint 3**.

---

## 1. Guía de Procesos de QA

### ¿Cómo escribir un caso de prueba?
Cada caso de prueba debe ser atómico, claro y reproducible por cualquier miembro del equipo. Debe contar con la siguiente estructura:
1. **ID:** Identificador único (ej: `CP-001`).
2. **Título/Nombre:** Breve descripción del objetivo del caso.
3. **Precondición:** Estado del sistema o datos necesarios antes de ejecutar el test.
4. **Pasos de Ejecución:** Instrucciones secuenciales numeradas para llevar a cabo la prueba.
5. **Resultado Esperado:** El comportamiento correcto esperado por el sistema.
6. **Resultado Obtenido:** Lo que realmente ocurrió durante la ejecución.
7. **Estado:** `Pasó` (Passed), `Falló` (Failed), `Bloqueado` (Blocked) o `No Ejecutado` (Not Run).

### ¿Cómo reportar un defecto (Bug)?
Cuando un caso de prueba falla, se debe reportar inmediatamente en el sistema de tracking (ej. Jira, GitLab Issues) con:
- **Título Claro:** Formato `[Componente] Acción - Síntoma del Defecto` (ej: `[Carga Dinero] Monto - Permite ingresar montos negativos`).
- **Descripción:** Breve explicación del problema.
- **Pasos para Reproducir:** Secuencia exacta de acciones para reproducir el fallo.
- **Resultado Esperado:** Qué debería haber ocurrido según el criterio de aceptación.
- **Resultado Obtenido:** Comportamiento real del sistema (con capturas o consola si aplica).
- **Gravedad y Prioridad:** Clasificación de impacto (Bloqueante, Alta, Media, Baja).
- **Evidencia:** Capturas de pantalla, grabaciones o logs de red/consola.

### Criterio de inclusión en Suite de Humo (Smoke Suite)
La suite de humo valida que las **funcionalidades más críticas e indispensables** del sistema estén estables tras un despliegue.
- **Criterio:** Si el caso de prueba falla, la aplicación es inusable en sus flujos troncales.
- **Casos Smoke Sprint 1:** Carga de Landing, Registro exitoso, Login en dos pasos y persistencia de sesión.
- **Casos Smoke Sprint 2:** Saldo con 2 centavos en ARS, barra lateral persistente, perfil, alta de tarjeta con detección de marca y eliminación de tarjetas.
- **Casos Smoke Sprint 3:**
  - Ingreso de dinero con tarjeta de débito o crédito (selección, monto y confirmación).
  - Comprobante de carga de saldo y actualización inmediata de balance.
  - Ingreso de dinero por transferencia externa con copiado de CVU y Alias.
  - Paginación cada 10 transacciones y orden cronológico de más nueva a más antigua.
  - Buscador de palabras clave en el listado de actividad.
  - Consulta del detalle de transacción (`/activity/[id]`) con datos de operación, fecha, monto y destino.

### Criterio de inclusión en Suite de Regresión (Regression Suite)
La suite de regresión asegura que validaciones detalladas, límites de negocio y combinaciones de filtros no se rompan tras modificaciones.
- **Casos Regression Sprint 3:** Validación de monto mayor a cero, botón deshabilitado si monto es $0, edición de monto con lápiz en pantalla de revisión, filtros por período (hoy, ayer, semana, 15 días, mes, 3 meses, año), filtros por operación (ingresos/egresos), filtro opcional por monto aproximado, y botón "Borrar filtros".

---

## 2. Planilla Consolidada de Casos de Prueba (Sprints 1, 2 y 3)

| ID | Componente | Título / Escenario | Precondición | Pasos | Resultado Esperado | Suite | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CP-001** | Landing Page | Carga de contenido promocional y beneficios | Ninguna | 1. Ingresar a `http://localhost:3000/`<br>2. Observar textos de la Landing Page y la imagen hero. | Los textos y la imagen principal se cargan dinámicamente desde la "base de datos" mock sin errores. | Smoke | **Pasó** |
| **CP-002** | Landing Page | Acceso directo a Iniciar Sesión y Registro | Ninguna | 1. Hacer clic en "Iniciar sesión"<br>2. Volver a la Landing y hacer clic en "Crear cuenta". | El sistema redirige correctamente a `/login` y `/register` respectivamente. | Smoke | **Pasó** |
| **CP-003** | Registro | Registro exitoso de usuario nuevo | Usuario no registrado | 1. Completar todos los campos válidos en `/register`<br>2. Presionar "Crear cuenta". | Los datos se guardan, y se redirige automáticamente a `/login` con mensaje de éxito. | Smoke | **Pasó** |
| **CP-004** | Registro | Validación de contraseñas desiguales | Ninguna | 1. Completar campos válidos pero usar contraseñas distintas<br>2. Intentar registrarse. | Se previene el envío y se muestra un error: "Las contraseñas no coinciden". | Regression | **Pasó** |
| **CP-005** | Registro | Validación de email ya registrado | Usuario existente | 1. Completar `/register` usando correo existente<br>2. Intentar registrarse. | Muestra mensaje de error: "El correo ya está registrado". | Regression | **Pasó** |
| **CP-006** | Login | Login en dos pasos - Paso 1: Email | Usuario registrado | 1. Ingresar a `/login`<br>2. Escribir email y hacer clic en "Continuar". | Se valida que el email existe y se despliega el formulario de contraseña y código. | Smoke | **Pasó** |
| **CP-007** | Login | Login en dos pasos - Código de 6 dígitos | Usuario registrado | 1. Ingresar email registrado<br>2. Ingresar contraseña y código de 6 dígitos<br>3. Presionar "Ingresar". | Genera la sesión y redirige al Dashboard (`/home`). | Smoke | **Pasó** |
| **CP-008** | Login | Login fallido por contraseña incorrecta | Usuario registrado | 1. Completar email<br>2. Ingresar contraseña inválida y presionar "Ingresar". | Muestra mensaje: "Contraseña incorrecta". | Regression | **Pasó** |
| **CP-010** | Dashboard | Persistencia de sesión al recargar | Usuario logueado | 1. Recargar la página en `/home` o cerrar y abrir pestaña. | La sesión se mantiene abierta sin desloguear al usuario. | Smoke | **Pasó** |
| **CP-011** | Dashboard | Cierre de sesión exitoso | Usuario logueado | 1. Hacer clic en "Cerrar sesión" en la barra de navegación o sidebar. | Se destruye la sesión y redirige a la Landing Page `/`. | Smoke | **Pasó** |
| **CP-012** | Recuperación | Recuperación de contraseña vía email | Usuario registrado | 1. Ingresar a `/recover`<br>2. Colocar email registrado y enviar. | Genera token y enlace `/reset?token=...` permitiendo reestablecer clave. | Regression | **Pasó** |
| **CP-013** | Recuperación | Visualización de contraseña (toggle) | En `/reset` | 1. Ingresar clave<br>2. Clic en ícono de ojo. | Alterna entre texto plano y caracteres enmascarados. | Regression | **Pasó** |
| **CP-014** | Dashboard | Dinero disponible con 2 centavos en ARS | Usuario autenticado | 1. Acceder a `/home`<br>2. Verificar el formato numérico del dinero disponible. | Se visualiza el saldo en ARS con exactamente dos centavos de detalle (ej: `$ 6.890.534,17`). | Smoke | **Pasó** |
| **CP-015** | Dashboard | Accesos directos "Ver tarjetas" y "Ver CVU" | Usuario autenticado | 1. Hacer clic en "Ver tarjetas"<br>2. Regresar y hacer clic en "Ver CVU". | Redirige correctamente a `/cards` y a `/profile` respectivamente. | Smoke | **Pasó** |
| **CP-016** | Barra Lateral | Redirección en cabecera y visibilidad persistente | Usuario autenticado | 1. Navegar por distintas páginas (`/home`, `/cards`, `/profile`)<br>2. Clic en nombre en cabecera. | La barra lateral permanece visible en todas las pantallas. Al hacer clic en el nombre del usuario se redirige a `/home`. | Smoke | **Pasó** |
| **CP-017** | Barra Lateral | Navegación lateral completa | Usuario autenticado | 1. Clic en cada enlace de la barra lateral (Inicio, Actividad, Perfil, Cargar dinero, Pagar Servicios, Tarjetas). | Cada enlace redirige a su respectiva ruta manteniendo el ítem activo en negrita. | Smoke | **Pasó** |
| **CP-018** | Dashboard | Resumen de últimos 10 movimientos | Usuario autenticado | 1. Observar la tarjeta "Tu actividad" en `/home`. | Se muestran un máximo de 10 transacciones ordenadas cronológicamente por fecha descendente. | Smoke | **Pasó** |
| **CP-019** | Dashboard | Búsqueda con tecla Enter hacia /activity | Usuario autenticado | 1. En `/home`, escribir un término en "Buscar en tu actividad"<br>2. Presionar tecla "Enter". | Redirige a `/activity?q=termino` con los resultados filtrados. | Smoke | **Pasó** |
| **CP-020** | Dashboard | Enlace "Ver toda tu actividad" | Usuario autenticado | 1. Hacer clic en "Ver toda tu actividad" al pie de la tarjeta. | Redirige a `/activity` mostrando el listado histórico completo. | Smoke | **Pasó** |
| **CP-021** | Mi Perfil | Consulta de datos y contraseña oculta | Usuario autenticado | 1. Ingresar a `/profile`<br>2. Verificar campos de datos personales, CVU, alias y contraseña. | Se visualizan Nombre, CUIT, Teléfono, CVU, Alias y la contraseña protegida con `******`. | Smoke | **Pasó** |
| **CP-022** | Mi Perfil | Copiar CVU y Alias al clipboard | En `/profile` | 1. Clic en ícono copiar de CVU<br>2. Clic en ícono copiar de Alias. | El texto se copia al portapapeles y se muestra feedback visual ("¡Copiado!"). | Regression | **Pasó** |
| **CP-023** | Mi Perfil | Edición de datos y validación de Alias "X.X.X" | En `/profile` | 1. Clic en editar Alias<br>2. Ingresar alias no conformado por 3 palabras (ej: `test`) -> Error.<br>3. Ingresar alias válido (ej: `palabra.palabra.palabra`) y guardar. | Se valida la regla de 3 palabras separadas por puntos y se persisten los cambios exitosamente. | Regression | **Pasó** |
| **CP-024** | Mi Perfil | Botón "Gestioná los medios de pago" | En `/profile` | 1. Clic en banner "Gestioná los medios de pago". | Redirige a la página de tarjetas (`/cards`). | Smoke | **Pasó** |
| **CP-025** | Tarjetas | Botón "Nueva tarjeta" hacia pantalla de alta | En `/cards` | 1. Clic en "Nueva tarjeta". | Redirige a la pantalla `/cards/new`. | Smoke | **Pasó** |
| **CP-026** | Alta de tarjeta | Detección automática de marca por primeros 4 dígitos | En `/cards/new` | 1. Escribir número comenzado en `4` (Visa).<br>2. Escribir número comenzado en `53` o `2221` (Mastercard).<br>3. Escribir número comenzado en `37` (AMEX). | El mockup y el badge detectan y actualizan visualmente el tipo de tarjeta en tiempo real. | Smoke | **Pasó** |
| **CP-027** | Alta de tarjeta | Límite máximo de 10 tarjetas | Usuario con 10 tarjetas | 1. Intentar agregar una tarjeta n° 11. | El sistema bloquea la acción y muestra el mensaje indicando que se llegó al límite de 10 tarjetas. | Regression | **Pasó** |
| **CP-028** | Tarjetas | Visualización de últimos 4 dígitos | En `/cards` | 1. Observar la lista "Tus tarjetas". | Cada tarjeta muestra solo su terminación en 4 dígitos (ej: "Terminada en 4067"). | Smoke | **Pasó** |
| **CP-029** | Tarjetas | Eliminación de tarjeta y mensaje vacío | En `/cards` | 1. Eliminar tarjetas asociadas hasta vaciar la lista. | Al eliminar la última tarjeta, se renderiza el mensaje exacto: "No tienes tarjetas asociadas". | Smoke | **Pasó** |
| **CP-030** | Opcional | Confirmación de email al editar en Perfil | En `/profile` | 1. Editar email del usuario por uno nuevo.<br>2. Abrir el enlace de verificación generado `/confirm-email?token=...`. | Confirma el nuevo correo y lo actualiza en el sistema con mensaje de éxito. | Regression | **Pasó** |
| **CP-031** | Carga de Dinero | Selección de método de carga | Usuario autenticado | 1. Ingresar a `/deposit`<br>2. Verificar opciones "Transferencia bancaria" y "Seleccionar tarjeta". | Se presentan ambos métodos con navegación hacia sus respectivos flujos. | Smoke | **Pasó** |
| **CP-032** | Carga de Dinero | Listado y selección de medios de pago adheridos | En `/deposit` | 1. Elegir "Seleccionar tarjeta"<br>2. Seleccionar una tarjeta con radio button. | Se listan las tarjetas adheridas y permite marcar una tarjeta para la operación. | Smoke | **Pasó** |
| **CP-033** | Carga de Dinero | Validación de monto y habilitación de botón | En `/deposit` | 1. Dejar monto en $0 o vacío -> Botón Continuar deshabilitado (gris).<br>2. Ingresar monto válido (ej: $300) -> Botón Continuar habilitado (lima). | Se valida que el monto sea estrictamente mayor a 0 antes de avanzar. | Regression | **Pasó** |
| **CP-034** | Carga de Dinero | Pantalla de revisión con edición de monto | En `/deposit` | 1. En pantalla "Revisá que está todo bien", presionar ícono lápiz.<br>2. Modificar monto y volver a continuar. | Permite corregir el importe antes de efectuar la transacción definitiva. | Regression | **Pasó** |
| **CP-035** | Carga de Dinero | Confirmación de carga e impacto en saldo | En `/deposit` | 1. Presionar "Continuar" en pantalla de revisión.<br>2. Verificar saldo y listado de actividad en `/home`. | El saldo disponible se incrementa por el monto exacto y se registra un movimiento de tipo `deposit`. | Smoke | **Pasó** |
| **CP-036** | Carga de Dinero | Pantalla de comprobante y descarga de voucher | En `/deposit` | 1. Completar carga de dinero.<br>2. Verificar banner verde "Ya cargamos el dinero en tu cuenta"<br>3. Clic en "Descargar comprobante". | Se despliega el comprobante formal con número de operación, fecha, monto y opción de impresión/PDF. | Smoke | **Pasó** |
| **CP-037** | Carga de Dinero | Carga por cuenta externa (CVU y Alias) | En `/deposit` | 1. Elegir "Transferencia bancaria"<br>2. Presionar íconos de copia de CVU y Alias. | Muestra CVU y Alias de la cuenta y los copia al portapapeles con confirmación visual. | Smoke | **Pasó** |
| **CP-038** | Mi Actividad | Paginación de 10 transacciones por página | En `/activity` | 1. Ingresar a `/activity`<br>2. Observar lista y presionar botones numéricos de paginación (1, 2, 3...). | Cada página renderiza exactamente 10 transacciones y navega fluidamente entre páginas. | Smoke | **Pasó** |
| **CP-039** | Mi Actividad | Orden cronológico por defecto (más nueva a más antigua) | En `/activity` | 1. Observar fechas de las transacciones en la primera página. | Los movimientos se ordenan descendentemente por fecha/hora de forma predeterminada. | Smoke | **Pasó** |
| **CP-040** | Mi Actividad | Búsqueda por palabras clave en título | En `/activity` | 1. Escribir "Rodrigo" en el buscador de actividad.<br>2. Observar los resultados. | Filtra instantáneamente las transacciones cuyo concepto o destino contenga el término. | Smoke | **Pasó** |
| **CP-041** | Mi Actividad | Filtro por período de tiempo | En `/activity` | 1. Clic en "Filtrar"<br>2. Seleccionar "Hoy", "Ayer", "Última semana", "Últimos 15 días", "Último mes", etc.<br>3. Clic en "Aplicar". | La lista se restringe únicamente a los movimientos ocurridos en el intervalo seleccionado. | Regression | **Pasó** |
| **CP-042** | Mi Actividad | Filtro por operaciones (Ingresos o Egresos) | En `/activity` | 1. En modal de filtros, pestaña "Operaciones", elegir "Ingresos".<br>2. Clic en "Aplicar". | Muestra únicamente montos positivos (ingresos de dinero y transferencias entrantes). | Regression | **Pasó** |
| **CP-043** | Mi Actividad | Filtro por monto aproximado (Opcional Sprint 3) | En `/activity` | 1. Pestaña "Monto", seleccionar rango (ej: "$1000 a $5000").<br>2. Clic en "Aplicar". | Filtra exclusivamente transacciones cuyos valores absolutos pertenezcan al intervalo. | Regression | **Pasó** |
| **CP-044** | Mi Actividad | Botón "Borrar filtros" | En `/activity` | 1. Con filtros activos, presionar "Borrar filtros". | Limpia todos los filtros seleccionados y recarga la lista completa por defecto. | Regression | **Pasó** |
| **CP-045** | Detalle Actividad | Consulta de detalle de transacción | En `/activity` | 1. Clic en una transacción de la lista.<br>2. Verificar datos en `/activity/[id]`. | Muestra estado "✓ Aprobada", fecha/hora, concepto, monto, destinatario y número de operación con voucher. | Smoke | **Pasó** |

---

## 3. Framework de Automatización (Java + Selenium)

Los casos troncales de la suite de Smoke (`CP-031`, `CP-032`, `CP-035`, `CP-036`, `CP-038`, `CP-040`, `CP-045`), junto con los de los Sprints 1 y 2, se encuentran automatizados bajo el patrón **Page Object Model (POM)** en [`automation/`](./automation/).
