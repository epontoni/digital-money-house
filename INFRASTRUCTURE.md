# Diseño de Infraestructura y Red - Digital Money House

Este documento detalla la arquitectura de infraestructura recomendada, las herramientas de virtualización y el diseño de la red lógica para soportar el ecosistema de microservicios de **Digital Money House**.

---

## 1. Herramientas Recomendadas y Justificación

### Git (Control de Versiones)
- **Rol:** Repositorio centralizado para el código fuente de todos los microservicios y del frontend.
- **Uso:** Implementación de flujos de trabajo (GitFlow o Trunk-Based Development) para la integración y despliegue continuo (CI/CD) mediante GitHub Actions o GitLab CI.

### Docker (Contenedores)
- **Rol:** Empaquetamiento y estandarización del entorno de ejecución de cada microservicio.
- **Uso:** Uso de `Dockerfile` para construir imágenes inmutables de cada servicio y `docker-compose.yml` para levantar la infraestructura completa localmente de forma uniforme en entornos de desarrollo y pruebas.

### Kubernetes / Docker Swarm (Orquestación de Microservicios)
- **Rol:** Gestión del ciclo de vida, escalabilidad, balanceo de carga y tolerancia a fallos de los contenedores en producción.

---

## 2. Boceto de la Red y sus Componentes (Arquitectura Lógica)

El siguiente diagrama en bloques describe el flujo de comunicación desde el cliente (navegador web o app móvil) a través de las capas de seguridad, enrutamiento y los microservicios individuales hasta la capa de datos.

```mermaid
graph TD
    %% Clientes externos
    subgraph Clients["Dispositivos del Cliente (HTTPS)"]
        Mobile["Dispositivo Móvil"]
        Desktop["Navegador Web Desktop"]
        Tablet["Dispositivo Tablet"]
    end

    %% Capa Perimetral y CDN
    subgraph Edge["Capa de Red Perimetral y Entrega"]
        DNS["Servidor DNS"]
        CDN["CDN (Contenido Estático - HTML/JS/CSS)"]
        WAF["WAF & Firewall (Filtro Anti-DDoS)"]
    end

    %% Capa de Entrada API
    subgraph DMZ["Red Desmilitarizada (DMZ)"]
        Gateway["API Gateway (Enrutamiento, SSL/TLS, Rate Limiting)"]
    end

    %% Capa de Microservicios
    subgraph PrivateNet["Red Interna Privada (Segura)"]
        AuthService["Auth Service (JWT, Registro, Login)"]
        AccountService["Account Service (Saldos y Transacciones)"]
        PaymentService["Payment Service (Pago de Servicios)"]
        NotificationService["Notification Service (Envío de Mails/Codes)"]
        Discovery["Service Discovery & Registry (Consul/Eureka)"]
    end

    %% Capa de Base de Datos y Almacenamiento
    subgraph DataLayer["Capa de Datos (Aislada de la Web)"]
        DB["Base de Datos Relacional (PostgreSQL - Balance, Users)"]
        Cache["Caché en Memoria (Redis - Sesiones, Tokens)"]
        Storage["Storage S3 (Imágenes de Perfil, Archivos)"]
    end

    %% Relaciones
    Clients --> DNS
    DNS --> CDN
    Clients --> WAF
    WAF --> Gateway
    
    Gateway -->|Enruta Auth /api/auth| AuthService
    Gateway -->|Enruta Cuentas /api/accounts| AccountService
    Gateway -->|Enruta Pagos /api/payments| PaymentService
    
    AuthService <--> Discovery
    AccountService <--> Discovery
    PaymentService <--> Discovery
    
    AuthService -->|Valida Sesiones| Cache
    AuthService -->|Lee/Escribe Usuarios| DB
    AccountService -->|Actualiza Balances| DB
    PaymentService -->|Registra Pagos| DB
    AccountService -->|Consulta Rápidamente| Cache
    AuthService -.->|Encola Tarea Código| NotificationService
    
    NotificationService -->|Envía Código/Email| SMTP["Servidor de Correo (SMTP Relay)"]

    classDef red fill:#f96,stroke:#333,stroke-width:2px;
    classDef blue fill:#69c,stroke:#333,stroke-width:1px;
    classDef green fill:#9c6,stroke:#333,stroke-width:1px;
    class WAF,Gateway red;
    class AuthService,AccountService,PaymentService,NotificationService blue;
    class DB,Cache,Storage green;
```

---

## 3. Descripción de los Componentes y Flujos de Datos

1. **Clientes:** Acceden a la aplicación. Las peticiones estáticas son servidas directamente por un **CDN** (Content Delivery Network) para reducir latencia.
2. **WAF (Web Application Firewall):** Filtra el tráfico web malicioso (inyección SQL, XSS) y ataques DDoS.
3. **API Gateway:** Único punto de entrada para todas las APIs dinámicas. Se encarga de terminar la conexión SSL, enrutar las solicitudes al microservicio correspondiente basado en el prefijo de la ruta, aplicar políticas de *Rate Limiting* (límite de peticiones) y validar las firmas de tokens de autenticación JWT.
4. **Red Privada Interna (Segura):** Los microservicios no están expuestos directamente a Internet. Se comunican entre sí utilizando protocolos ligeros (REST, gRPC) y registran sus instancias en un servidor de **Service Discovery** (Consul/Eureka).
5. **Capa de Base de Datos:** 
   - **PostgreSQL / MySQL:** Almacena la información transaccional e histórica con alta consistencia de forma segura.
   - **Redis (Caché):** Almacena tokens temporales de verificación, sesiones e información consultada frecuentemente para acelerar los tiempos de respuesta.
   - **Object Storage (S3):** Para almacenar de forma eficiente imágenes estáticas y assets subidos por usuarios.
