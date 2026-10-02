# Framework de Automatización de Pruebas - Digital Money House

Este framework implementa la automatización de la **Suite de Pruebas de Humo (Smoke Suite)** para la aplicación **Digital Money House (Sprint 2)**, utilizando **Java 17**, **Selenium WebDriver 4**, **TestNG** y el patrón de diseño **Page Object Model (POM)**.

---

## 1. Requisitos Previos

- **Java JDK 17 o superior** instalado y configurado en el `PATH` (`java -version`).
- **Apache Maven 3.8+** instalado (`mvn -version`).
- Navegador **Google Chrome** instalado (WebDriverManager gestionará automáticamente el chromedriver compatible).
- La aplicación web debe estar corriendo localmente en `http://localhost:3000` (`npm run dev`).

---

## 2. Estructura del Framework

```
automation/
├── pom.xml                                   # Configuración de dependencias Maven
├── testng.xml                                # Suite de ejecución TestNG
├── README.md                                 # Guía de uso y documentación
└── src/
    └── test/
        └── java/
            └── com/digitalmoneyhouse/
                ├── base/
                │   └── BaseTest.java         # Inicialización, teardown y autenticación mock
                ├── pages/                    # Page Object Model (POM)
                │   ├── DashboardPage.java    # Mapeo y acciones del Dashboard (/home)
                │   ├── ProfilePage.java      # Mapeo y acciones de Mi Perfil (/profile)
                │   └── CardsPage.java        # Mapeo y acciones de Tarjetas (/cards, /cards/new)
                └── tests/
                    └── SmokeTestSuite.java   # Casos de prueba automatizados (Smoke Suite)
```

---

## 3. Casos de Prueba Automatizados (Smoke Suite)

| Caso de Prueba | Descripción | Objetivo Automatizado |
| :--- | :--- | :--- |
| **CP-014** | Formato de Saldo en ARS | Valida que el dinero disponible comience con `$` y exprese exactamente dos centavos decimales (ej: `$ 6.890.534,17`). |
| **CP-015** | Accesos directos | Valida la navegación a `/cards` desde "Ver tarjetas" y a `/profile` desde "Ver CVU". |
| **CP-016** | Persistencia y Header | Valida que la barra lateral permanezca visible y que el clic en el nombre de usuario redirija a `/home`. |
| **CP-019 / CP-020** | Buscador de Actividad | Valida la redirección hacia `/activity?q=...` al presionar la tecla `Enter`. |
| **CP-021** | Perfil y Password Oculta | Valida la consulta de datos personales y que la contraseña esté enmascarada con `******`. |
| **CP-024** | Botón Gestionar Medios de Pago | Valida la redirección hacia `/cards` desde la pantalla de perfil. |
| **CP-025 / CP-026** | Alta y Detección de Marca | Valida la apertura del formulario y la detección automática de Visa, Mastercard o AMEX leyendo los primeros 4 dígitos. |
| **CP-028** | Formato de Tarjetas | Valida que la lista de tarjetas muestre únicamente los últimos 4 dígitos (`Terminada en XXXX`). |

---

## 4. Ejecución de Pruebas

### Ejecución en Modo Visual (con ventana de Chrome):
```bash
cd automation
mvn clean test
```

### Ejecución en Modo Headless (ideal para servidores y CI/CD):
```bash
mvn clean test -Dheadless=true
```

### Reporte de Resultados:
Al finalizar, Maven y TestNG generan un reporte HTML interactivo en:
```
automation/target/surefire-reports/index.html
```

---

## 5. Integración Continua (GitLab CI)

Para ejecutar estas pruebas de forma desatendida en GitLab, se incluye el archivo de pipeline `.gitlab-ci.yml` configurado con contenedor Docker de Chrome y Maven:

```yaml
# .gitlab-ci.yml
stages:
  - test

smoke_tests:
  stage: test
  image: markhobson/maven-chrome:jdk-17
  services:
    - name: node:20-alpine
      alias: app-server
  script:
    - cd automation
    - mvn clean test -Dheadless=true
  artifacts:
    when: always
    reports:
      junit: automation/target/surefire-reports/junitreports/TEST-*.xml
    paths:
      - automation/target/surefire-reports/
```
