# Arquitectura y Despliegue en AWS - Digital Money House

Este documento detalla el diseño de arquitectura cloud, la configuración de red y la estrategia de despliegue continuo para montar el ecosistema de **Digital Money House** en **Amazon Web Services (AWS)** de forma escalable, segura y de alta disponibilidad.

---

## 1. Diagrama de Arquitectura Cloud (AWS)

```mermaid
graph TD
    User["Clientes (Web / Mobile)"] --> Route53["Amazon Route 53 (DNS)"]
    Route53 --> CloudFront["Amazon CloudFront (CDN & SSL ACM)"]
    
    subgraph AWSCloud["Nube AWS (Región us-east-1)"]
        CloudFront -->|Contenido Estático (_next/static, public)| S3["Bucket Amazon S3 (Static Assets)"]
        CloudFront -->|Rutas Dinámicas (SSR / API)| WAF["AWS WAF (Firewall & Rate Limit)"]
        WAF --> ALB["Application Load Balancer (ALB)"]

        subgraph VPC["Virtual Private Cloud (VPC: 10.0.0.0/16)"]
            subgraph PublicSubnets["Subredes Públicas (AZ-a / AZ-b)"]
                ALB
                NAT["NAT Gateway"]
            end

            subgraph PrivateAppSubnets["Subredes Privadas App (AZ-a / AZ-b)"]
                subgraph ECSCluster["Amazon ECS (AWS Fargate)"]
                    Task1["Next.js App Container 1"]
                    Task2["Next.js App Container 2"]
                end
            end

            subgraph PrivateDBSubnets["Subredes Privadas Datos (AZ-a / AZ-b)"]
                RDS["Amazon Aurora / RDS PostgreSQL (Multi-AZ)"]
                Redis["Amazon ElastiCache Redis (Sesiones & Cache)"]
            end
        end

        ALB --> ECSCluster
        Task1 --> RDS
        Task2 --> RDS
        Task1 --> Redis
        Task2 --> Redis

        subgraph Management["Monitoreo y Seguridad"]
            SM["AWS Secrets Manager"]
            CW["Amazon CloudWatch (Logs & Métricas)"]
            ECR["Amazon ECR (Registro de Imágenes Docker)"]
        end

        ECSCluster --> SM
        ECSCluster --> CW
        ECR --> ECSCluster
    end
```

---

## 2. Componentes de la Solución

### 1. Entrega y Red Perimetral (Edge & DNS)
- **Amazon Route 53:** Servicio DNS de baja latencia con enrutamiento por geolocalización y comprobaciones de estado de salud (Health Checks).
- **Amazon CloudFront:** Red de distribución de contenido (CDN) distribuida globalmente con certificados SSL/TLS emitidos por **AWS Certificate Manager (ACM)** con renovación automática.
- **AWS WAF (Web Application Firewall):** Reglas administradas contra inyecciones SQL, Cross-Site Scripting (XSS), mitigación DDoS y limitación de tasa por IP.

### 2. Capa de Cómputo (Next.js Application)
- **Amazon Elastic Container Service (ECS) con AWS Fargate:**
  - Ejecución serverless de contenedores Docker de la aplicación Next.js sin necesidad de aprovisionar ni administrar instancias EC2.
  - **Auto-Scaling:** Escala horizontalmente entre 2 y 10 tareas basadas en consumo de CPU y memoria (> 70%).
  - Despliegues **Zero-Downtime** mediante estrategias de actualización continua (Rolling Updates).
- **Application Load Balancer (ALB):** Distribuye el tráfico entrante de manera uniforme entre las tareas de Fargate a través de múltiples zonas de disponibilidad (Multi-AZ).

### 3. Capa de Almacenamiento y Datos
- **Amazon S3:** Almacenamiento seguro e inmutable de assets estáticos compilados (`/_next/static/*`), imágenes de perfil y comprobantes de transacciones.
- **Amazon Aurora PostgreSQL / RDS:** Motor de base de datos relacional administrado con replicación síncrona Multi-AZ y copias de seguridad continuas automatizadas (Point-in-Time Recovery).
- **Amazon ElastiCache (Redis):** Cache en memoria para almacenamiento de tokens de sesión y limitación de tasa de solicitudes (rate limiting).

### 4. Seguridad, Secretos y Observabilidad
- **AWS Secrets Manager:** Gestión y rotación centralizada de claves criptográficas, credenciales de base de datos y llaves de APIs externas.
- **Amazon CloudWatch:** Centralización de logs de contenedores (`awslogs`), dashboards de métricas operacionales y alarmas automáticas por correo (SNS).

---

## 3. Guía de Despliegue con Terraform (IaC)

A continuación se presenta un extracto de la configuración en **Terraform** para aprovisionar el clúster de ECS Fargate:

```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

# ECS Cluster
resource "aws_ecs_cluster" "dmh_cluster" {
  name = "dmh-production-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS Fargate Task Definition
resource "aws_ecs_task_definition" "dmh_app" {
  family                   = "dmh-nextjs-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "dmh-frontend"
      image     = "${aws_ecr_repository.dmh_repo.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" }
      ]
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = aws_secretsmanager_secret.db_secret.arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/dmh-production"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "nextjs"
        }
      }
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "dmh_service" {
  name            = "dmh-production-service"
  cluster         = aws_ecs_cluster.dmh_cluster.id
  task_definition = aws_ecs_task_definition.dmh_app.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_app_a.id, aws_subnet.private_app_b.id]
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.dmh_tg.arn
    container_name   = "dmh-frontend"
    container_port   = 3000
  }
}
```

---

## 4. Pipeline de CI/CD para AWS

1. **Commit en rama `master` / `release`:**
   - Ejecuta pruebas unitarias y linters.
   - Construye la imagen Docker optimizada (`Dockerfile` multi-stage para Next.js).
2. **Push a Amazon ECR:**
   - La imagen se etiqueta con el hash del commit (`$CI_COMMIT_SHA`) y `latest`.
3. **Despliegue a ECS Fargate:**
   - Se actualiza la definición de tarea en ECS y el servicio efectúa un despliegue rolling sin interrupciones.
4. **Invalidación de Cache en CloudFront:**
   - Se invalida `/*` en la distribución de CloudFront para asegurar que los usuarios reciban los nuevos assets compilados de inmediato.
