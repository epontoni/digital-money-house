# Plan de Pruebas (Testing Kickoff & Manual Testing) - Sprint 1

Este documento detalla la estrategia de aseguramiento de calidad (QA), metodologías de reporte y el diseño de la suite de pruebas manuales para las funcionalidades de la billetera virtual **Digital Money House** (Sprint 1).

---

## 1. Guía de Procesos de QA

### ¿Cómo escribir un caso de prueba?
Cada caso de prueba debe ser atómico, claro y reproducible por cualquier miembro del equipo. Debe contar con la siguiente estructura:
1. **ID:** Identificador único (ej: `CP-001`).
2. **Título/Nombre:** Breve descripción del objetivo del caso.
3. **Precondición:** Estado del sistema o datos necesarios antes de ejecutar el test.
4. **Pasos de Ejecución:** Instrucciones secuenciales numeradas para llevar a cabo la prueba.
5. **Resultado Esperado:** El comportamiento correcto esperado por el sistema.
6. **Resultado Obtenido:** Lo que realmente ocurrió (a completar durante la ejecución).
7. **Estado:** `Pasó` (Passed), `Falló` (Failed), `Bloqueado` (Blocked) o `No Ejecutado` (Not Run).

### ¿Cómo reportar un defecto (Bug)?
Cuando un caso de prueba falla, se debe reportar inmediatamente en el sistema de tracking (ej. Jira, GitHub Issues) con:
- **Título Claro:** Formato `[Componente] Acción - Síntoma del Defecto` (ej: `[Registro] Validación - Campo Teléfono acepta letras`).
- **Descripción:** Breve explicación del problema.
- **Pasos para Reproducir:** Secuencia exacta de acciones para volver a ver el error.
- **Resultado Esperado:** Qué debería haber pasado.
- **Resultado Obtenido:** Qué pasó en realidad (con mensajes de error del sistema o consola si aplica).
- **Gravedad y Prioridad:** Clasificación del impacto en el negocio (Bloqueante, Alta, Media, Baja).
- **Evidencia:** Capturas de pantalla, grabaciones o logs de red/consola.

### Criterio de inclusión en Suite de Humo (Smoke Suite)
La suite de humo valida que las **funcionalidades más críticas e indispensables** del sistema estén estables tras un despliegue.
- **Criterio:** Si el caso de prueba falla, la aplicación es inusable en sus flujos primarios.
- **Ejemplos en Sprint 1:** Carga correcta de la Landing Page, Registro de usuario nuevo con datos válidos, e Inicio de sesión exitoso.

### Criterio de inclusión en Suite de Regresión (Regression Suite)
La suite de regresión asegura que **funcionalidades secundarias, validaciones detalladas y flujos de error** no se hayan roto debido a nuevas modificaciones de código.
- **Criterio:** Casos que validan combinaciones complejas, campos opcionales, validaciones de errores de campos, expiraciones de sesión o flujos alternativos.
- **Ejemplos en Sprint 1:** Validación de formato de email, mostrar/ocultar contraseñas, e intentos fallidos de login.

---

## 2. Planilla de Casos de Pruebas (Sprint 1)

A continuación se detalla la suite de pruebas clasificada.

| ID | Componente | Título / Escenario | Precondición | Pasos | Resultado Esperado | Suite | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CP-001** | Landing Page | Carga de contenido promocional y beneficios | Ninguna | 1. Ingresar a `http://localhost:3000/`<br>2. Observar textos de la Landing Page y la imagen hero. | Los textos y la imagen principal se cargan dinámicamente desde la "base de datos" mock sin errores. | Smoke | **Pasó** |
| **CP-002** | Landing Page | Acceso directo a Iniciar Sesión y Registro | Ninguna | 1. Hacer clic en "Iniciar sesión"<br>2. Volver a la Landing y hacer clic en "Crear cuenta". | El sistema redirige correctamente a `/login` y `/register` respectivamente. | Smoke | **Pasó** |
| **CP-003** | Registro | Registro exitoso de usuario nuevo | Usuario no registrado | 1. Completar todos los campos válidos en `/register`<br>2. Presionar "Crear cuenta". | Los datos se guardan, y se redirige automáticamente a `/login` con mensaje de éxito. | Smoke | **Pasó** |
| **CP-004** | Registro | Validación de contraseñas desiguales | Ninguna | 1. Completar campos válidos pero usar contraseñas distintas en "Contraseña" y "Confirmar contraseña"<br>2. Intentar registrarse. | Se previene el envío y se muestra un error: "Las contraseñas no coinciden". | Regression | **Pasó** |
| **CP-005** | Registro | Validación de email ya registrado | Usuario con email `test@test.com` ya existe | 1. Completar `/register` usando `test@test.com`<br>2. Intentar registrarse. | Muestra mensaje de error: "El correo ya está registrado". | Regression | **Pasó** |
| **CP-006** | Login | Login en dos pasos - Paso 1: Email | Usuario registrado | 1. Ingresar a `/login`<br>2. Escribir email válido y hacer clic en "Continuar". | Se valida que el email existe y se despliega el formulario de contraseña y código de verificación. | Smoke | **Pasó** |
| **CP-007** | Login | Login en dos pasos - Validación de primer ingreso con código de 6 dígitos | Usuario registrado realizando primer login | 1. Ingresar email registrado en paso 1<br>2. Ingresar contraseña y el código de 6 dígitos enviado por consola<br>3. Presionar "Ingresar". | Se genera la sesión correctamente y se redirige a `/home` (Dashboard). | Smoke | **Pasó** |
| **CP-008** | Login | Login fallido por contraseña incorrecta | Usuario registrado | 1. Completar paso 1<br>2. Ingresar contraseña incorrecta y presionar "Ingresar". | Muestra mensaje: "Contraseña incorrecta". | Regression | **Pasó** |
| **CP-010** | Dashboard | Persistencia de sesión al recargar | Usuario logueado en `/home` | 1. Recargar la página en `/home` o cerrar y abrir pestaña. | La sesión no se cierra y mantiene al usuario logueado en el Home. | Smoke | **Pasó** |
| **CP-011** | Dashboard | Cierre de sesión exitoso | Usuario logueado en `/home` | 1. Hacer clic en "Cerrar sesión" en la barra de navegación. | Se elimina el token de `localStorage`, se limpia la cookie, y se redirige a `/` (Landing Page). | Smoke | **Pasó** |
| **CP-012** | Recuperación | Recuperación de contraseña vía email | Usuario registrado | 1. Ingresar a `/recover`<br>2. Colocar email registrado y enviar. | Muestra el enlace mock `/reset?token=...` enviado. Al ingresar al enlace, permite resetear la clave. | Regression | **Pasó** |
| **CP-013** | Recuperación | Visualización de caracteres de contraseña | En `/reset` | 1. Ingresar caracteres en el campo de contraseña<br>2. Hacer clic en el botón con ícono de ojo. | Se alterna entre modo oculto (••••) y visible de los caracteres de la contraseña. | Regression | **Pasó** |
