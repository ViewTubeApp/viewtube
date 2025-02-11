# ViewTube

[![Pipeline](https://github.com/viewtubeapp/viewtube/actions/workflows/pipeline.yml/badge.svg)](https://github.com/viewtubeapp/viewtube/actions/workflows/pipeline.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Node Version](https://img.shields.io/badge/node-20.18.1-brightgreen.svg)](https://nodejs.org)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fporngid.xyz%2F)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

A modern video streaming platform built with the T3 Stack, designed to run on Docker Swarm.

## 🚀 Features

- Video streaming with adaptive quality
- User authentication with Authentik SSO
- Video upload and management
- CDN integration for optimized content delivery
- Responsive design
- Docker-ready for production deployment

## 🛠️ Tech Stack

- **Frontend:**

  - [Next.js](https://nextjs.org) - React framework for production
  - [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
  - [tRPC](https://trpc.io) - End-to-end typesafe APIs

- **Backend:**

  - [NextAuth.js](https://next-auth.js.org) - Authentication for Next.js
  - [Authentik](https://goauthentik.io) - Identity Provider and SSO platform
  - [Prisma](https://prisma.io) - Type-safe ORM
  - [Drizzle](https://orm.drizzle.team) - TypeScript ORM
  - [PostgreSQL](https://www.postgresql.org/) - Database
  - [RabbitMQ](https://www.rabbitmq.com/) - Message broker
  - [FFmpeg](https://ffmpeg.org/) - Video processing
  - [Hermes](extra/hermes) - Go-based video processing server

- **Infrastructure:**
  - [Docker Swarm](https://docs.docker.com/engine/swarm/) - Container Orchestration
  - [Traefik](https://traefik.io/) - Edge Router & Load Balancer
  - [Nginx](https://nginx.org/) - Static file serving & CDN
  - [Make](https://www.gnu.org/software/make/) - Build automation
  - [Prometheus](https://prometheus.io/) - Metrics Collection & Storage
  - [Grafana](https://grafana.com/) - Metrics Visualization & Dashboards
  - [Node Exporter](https://github.com/prometheus/node_exporter) - System Metrics Collection
  - [cAdvisor](https://github.com/google/cadvisor) - Container Metrics Collection

## 📋 Prerequisites

- Node.js 20.18.1 or later
- pnpm 9.14.2 or later
- Docker with Swarm mode enabled
- FFmpeg (for video processing)
- GNU Make
- Go 1.21 or later (for Hermes development)
- RabbitMQ 3.12 or later

## 🎥 Video Processing Architecture

The application uses a microservices architecture for video processing:

1. **Web Server (Next.js)**: Handles file uploads and client communication
2. **RabbitMQ**: Message broker for reliable task distribution with:
   - Topic exchange for flexible routing
   - Quorum queues for high availability
   - In-memory limits for optimal performance
3. **Hermes**: Go-based video processing server that:
   - Generates video thumbnails
   - Creates preview sprites with WebVTT
   - Produces video trailers
   - Processes videos concurrently
   - Uses PostgreSQL for task state management

### Video Processing Flow

1. Client uploads video to web server
2. Web server:
   - Saves video to disk
   - Creates task entries in PostgreSQL
   - Publishes processing tasks to RabbitMQ exchange `video/processing` with routing key `video.task.*`
3. Hermes:
   - Consumes tasks from `video/tasks` queue
   - Updates task status to "processing" in PostgreSQL
   - Processes videos using FFmpeg
   - Updates task status to "completed" or "failed" in PostgreSQL
   - Updates video status when all tasks are complete
4. Web server:
   - Polls PostgreSQL for task status updates
   - Updates UI based on task status
   - Makes processed content available via CDN

### Authentication Architecture

The application uses Authentik as the Identity Provider:

1. **Authentik**: Handles all authentication and authorization:
   - OAuth 2.0/OpenID Connect provider
   - Single Sign-On (SSO) capabilities
   - User management and access control
   - Secure token handling
2. **Integration**:
   - Web application authenticates via OAuth 2.0
   - JWT tokens for secure session management
   - Role-based access control (RBAC)
   - Automatic SSL/TLS via Traefik

## 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/viewtubeapp/viewtube.git
   cd viewtube
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration (see Environment Variables section below)

4. **Start development environment**

   ```bash
   # Start database
   make dev-db

   # Run database migrations
   pnpm db:migrate

   # Start development server
   pnpm dev
   ```

5. **Access the application**
   - Web UI: http://localhost:3000
   - API Documentation: http://localhost:3000/api/docs

## 🔧 Environment Variables

### Application Settings

| Variable              | Description                       | Required | Default |
| --------------------- | --------------------------------- | -------- | ------- |
| `UPLOADS_VOLUME`      | Path to the uploads volume        | Yes      | -       |
| `NEXT_PUBLIC_URL`     | Public URL of the web application | Yes      | -       |
| `NEXT_PUBLIC_BRAND`   | Brand name for the application    | Yes      | -       |
| `NEXT_PUBLIC_CDN_URL` | CDN URL for static assets         | Yes      | -       |

### Authentication (Authentik)

| Variable                       | Description                    | Required | Default |
| ------------------------------ | ------------------------------ | -------- | ------- |
| `AUTH_URL`                     | Sign in URL                    | No       | -       |
| `AUTH_TRUST_HOST`              | Trust host for Authentik       | No       | -       |
| `AUTHENTIK_SECRET_KEY`         | Secret key for Authentik       | Yes      | -       |
| `AUTHENTIK_AUTH_ISSUER`        | Authentik OAuth issuer URL     | Yes      | -       |
| `AUTHENTIK_AUTH_CLIENT_ID`     | OAuth client ID from Authentik | Yes      | -       |
| `AUTHENTIK_AUTH_CLIENT_SECRET` | OAuth client secret            | Yes      | -       |

### Database (PostgreSQL)

| Variable            | Description                      | Required | Default |
| ------------------- | -------------------------------- | -------- | ------- |
| `POSTGRES_HOST`     | PostgreSQL host                  | Yes      | -       |
| `POSTGRES_PORT`     | PostgreSQL port                  | Yes      | 5432    |
| `POSTGRES_DB`       | PostgreSQL database name         | Yes      | -       |
| `POSTGRES_USER`     | PostgreSQL username              | Yes      | -       |
| `POSTGRES_PASSWORD` | Path to PostgreSQL password file | Yes      | -       |

### Message Queue (RabbitMQ)

| Variable            | Description          | Required | Default |
| ------------------- | -------------------- | -------- | ------- |
| `RABBITMQ_HOST`     | RabbitMQ server host | Yes      | -       |
| `RABBITMQ_PORT`     | RabbitMQ server port | Yes      | 5672    |
| `RABBITMQ_USER`     | RabbitMQ username    | Yes      | -       |
| `RABBITMQ_PASSWORD` | RabbitMQ password    | Yes      | -       |

## 🐳 Docker Swarm Deployment

The application is designed to run on Docker Swarm. Here's how to deploy it:

1. **Initialize Docker Swarm** (if not already done)

   ```bash
   docker swarm init
   ```

2. **Set up environment**

   ```bash
   # Setup remote environment
   make env-setup

   # Switch to remote environment
   make env-remote
   ```

3. **Build and publish images**

   ```bash
   # Build and push all images
   make docker-publish

   # Or build individually
   make web-build
   make nginx-build
   ```

4. **Deploy the stack**

   ```bash
   # Deploy the full stack
   make app-deploy

   # To stop the stack
   make app-stop
   ```

## 🛠 Monitoring Stack

The application includes a comprehensive monitoring setup with the following components:

### Components

- **Prometheus**: Time series database for metrics collection

  - Accessible at: `prometheus.{REMOTE_HOST}`
  - Collects metrics from all services
  - Configured for persistent storage

- **Grafana**: Metrics visualization and dashboarding

  - Accessible at: `grafana.{REMOTE_HOST}`
  - Default credentials: admin/admin (configurable)
  - Pre-configured to use Prometheus as data source

- **pgAdmin**: Database management and monitoring

  - Accessible at: `pgadmin.{REMOTE_HOST}`
  - Credentials configured via environment variables
  - Secure access over HTTPS with Traefik integration

- **Traefik Dashboard**: Edge router monitoring and management

  - Accessible at: `traefik.{REMOTE_HOST}`
  - Default credentials: admin/admin (configurable)
  - Real-time routing table and middleware status
  - Service health monitoring
  - TLS certificate management

- **Node Exporter**: System metrics collection

  - Collects host-level metrics
  - CPU, memory, disk, and network statistics
  - Mounted with read-only access to host system

- **cAdvisor**: Container metrics collection
  - Provides container-level metrics
  - Resource usage and performance characteristics
  - Auto-discovery of containers

### Key Metrics

- System-level metrics (via Node Exporter)

  - CPU usage and load
  - Memory utilization
  - Disk I/O and space usage
  - Network statistics

- Container metrics (via cAdvisor)

  - Container CPU usage
  - Memory consumption
  - Network traffic
  - Filesystem usage

- Application metrics
  - Service health status
  - Request latencies
  - Error rates
  - Custom business metrics

### Security

- All monitoring endpoints are secured with TLS via Let's Encrypt
- Grafana access is protected by authentication
- Prometheus is accessible only through HTTPS
- Node Exporter and cAdvisor are not exposed externally

### Scaling

The monitoring stack is designed to scale with your application:

- Persistent storage for long-term metric retention
- Automatic service discovery for new containers
- Configurable retention periods and storage options

### Database Management (pgAdmin)

| Variable           | Description            | Required | Default |
| ------------------ | ---------------------- | -------- | ------- |
| `PGADMIN_EMAIL`    | pgAdmin admin email    | Yes      | -       |
| `PGADMIN_PASSWORD` | pgAdmin admin password | Yes      | -       |

## 🛠️ Available Make Commands

| Command               | Description                  |
| --------------------- | ---------------------------- |
| **Development**       |                              |
| `make dev`            | Run all development services |
| `make db-start`       | Start PostgreSQL database    |
| `make redis-start`    | Start Redis server           |
| `make auth-start`     | Start Authentik services     |
| `make hermes-start`   | Run Hermes Go server         |
| `make rabbitmq-start` | Start RabbitMQ server        |
| **Environment**       |                              |
| `make env-local`      | Switch to local environment  |
| `make env-remote`     | Switch to remote environment |
| `make env-setup`      | Setup remote environment     |

## 📦 Project Structure

```
.
├── src/                      # Application source code
│   ├── app/                 # Next.js app router pages and layouts
│   ├── components/          # Reusable React components
│   ├── constants/           # Application constants and enums
│   ├── hooks/              # Custom React hooks
│   ├── lib/                  # Core libraries and configurations
│   ├── paraglide/            # Internationalization (i18n) setup
│   ├── server/               # Server-side code and API routes
│   ├── styles/               # Global styles and Tailwind utilities
│   ├── trpc/                 # tRPC router and procedure definitions
│   └── utils/                # Shared utility functions
├── extra/                    # Additional components
│   └── hermes/               # Go-based video processing server
│       ├── amqp/             # RabbitMQ connection and channel management
│       ├── amqpconfig/       # RabbitMQ configuration and setup
│       ├── app/              # Application core components
│       ├── config/           # Configuration management
│       ├── database/         # Database connection and models
│       ├── repository/       # Data access layer
│       ├── task/             # Task processing and management
│       ├── utils/            # Utility functions and helpers
│       ├── video/            # Video processing logic
│       └── worker/           # Background worker implementation
├── public/                   # Static assets
├── scripts/                  # Utility scripts
├── drizzle/                  # Database migrations
├── .docker/                  # Docker-related files
│   ├── compose/              # Docker Compose service definitions
│   │   ├── app.yaml          # Web and Hermes services
│   │   ├── auth.yaml         # Authentik services
│   │   ├── cache.yaml        # Redis service
│   │   ├── database.yaml     # PostgreSQL service
│   │   ├── messaging.yaml    # RabbitMQ service
│   │   ├── monitoring.yaml   # Prometheus, Grafana, and exporters
│   │   ├── proxy.yaml        # Traefik and Nginx services
│   │   └── tools.yaml        # Portainer and pgAdmin services
│   └── Dockerfile.*          # Service-specific Dockerfiles
├── .github/                  # GitHub workflows and configuration
├── .next/                    # Next.js build output
├── node_modules/             # Node.js dependencies
├── compose.yaml              # Main Docker Swarm composition
└── config files              # Various configuration files (*.config.*, etc.)
```

2. **Prettier**

   - Configured in `prettier.config.js`
   - Consistent code formatting
   - Format code:
     ```bash
     pnpm format
     ```

3. **PostCSS**
   - Configured in `postcss.config.js`
   - Integrates with Tailwind CSS
   - Handles CSS transformations

### Database Management

The project uses Drizzle ORM for database management:

1. **Create a migration**

   ```bash
   pnpm db:generate
   ```

2. **Apply migrations**

   ```bash
   pnpm db:migrate
   ```

3. **View migration status**
   ```bash
   pnpm db:status
   ```

### Configuration Files

1. **Next.js (`next.config.ts`)**

   - Environment variables configuration
   - API routes configuration
   - Build optimization settings

2. **Drizzle ORM (`drizzle.config.ts`)**

   - Database connection settings
   - Migration configuration
   - Schema location

3. **Tailwind CSS (`tailwind.config.ts`)**
   - Theme customization
   - Plugin configuration
   - Content paths

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [T3 Stack](https://create.t3.gg/) for the amazing foundation
- All contributors who have helped this project grow
