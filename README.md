```
  _    ___              ______      __
 | |  / (_)__ _      __/_  __/_  __/ /_  ___
 | | / / / _ \ | /| / // / / / / / __ \/ _ \
 | |/ / /  __/ |/ |/ // / / /_/ / /_/ /  __/
 |___/_/\___/|__/|__//_/  \__,_/_.___/\___/
```

A modern video streaming platform built with the T3 Stack, designed to run on Docker Swarm.

[![Pipeline](https://github.com/viewtubeapp/viewtube/actions/workflows/pipeline.yml/badge.svg)](https://github.com/viewtubeapp/viewtube/actions/workflows/pipeline.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![Node Version](https://img.shields.io/badge/node-22.13.1-brightgreen.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-19.0.0-blue.svg)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/next.js-15.1.7-black.svg)](https://nextjs.org/)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fviewtube.app%2F)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

## 🚀 Features

- **Video Management**

  - Adaptive quality video streaming
  - Automatic video processing and optimization
  - Video thumbnail and preview generation
  - Trailer generation
  - Progress tracking for uploads and processing

- **User Experience**

  - Modern, responsive UI with Tailwind CSS
  - Internationalization (i18n) support
  - Smooth animations with Motion
  - Accessible components with Radix UI
  - Real-time updates and notifications
  - Infinite scroll for video lists

- **Authentication & Security**

  - Single Sign-On (SSO) with Authentik
  - Role-based access control (RBAC)
  - Secure session management
  - SSL/TLS encryption

- **Infrastructure**

  - Docker Swarm orchestration
  - Automatic scaling and load balancing
  - CDN integration for optimized delivery
  - Comprehensive monitoring and metrics
  - Zero-downtime deployments

- **Developer Experience**
  - Type-safe API with tRPC
  - Database migrations with Drizzle
  - End-to-end type safety
  - Automated testing and CI/CD
  - Hot module replacement in development

## 🛠️ Tech Stack

- **Frontend:**

  - [Next.js 15](https://nextjs.org) - React framework for production
  - [React 19](https://react.dev) - UI library with latest features
  - [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS framework
  - [tRPC 11](https://trpc.io) - End-to-end typesafe APIs
  - [Vidstack](https://vidstack.io) - Media player components
  - [Radix UI](https://www.radix-ui.com) - Unstyled accessible components
  - [Geist](https://vercel.com/font) - Modern sans-serif font
  - [Motion](https://motion.dev) - Animation library
  - [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) - Type-safe i18n

- **Backend:**

  - [NextAuth.js 5](https://next-auth.js.org) - Authentication for Next.js
  - [Authentik](https://goauthentik.io) - Identity Provider and SSO platform
  - [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM
  - [PostgreSQL](https://www.postgresql.org/) - Database
  - [RabbitMQ](https://www.rabbitmq.com/) - Message broker
  - [FFmpeg](https://ffmpeg.org/) - Video processing
  - [Hermes](extra/hermes) - Go-based video processing server
  - [Sharp](https://sharp.pixelplumbing.com/) - Image processing

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

- Node.js 22.13.1 or later
- npm 11.2.0 or later
- Docker with Swarm mode enabled
- FFmpeg (for video processing)
- GNU Make
- Go 1.21 or later (for Hermes development)
- PostgreSQL 16 or later
- RabbitMQ 3.12 or later

## 🎥 Video Processing Architecture

The application uses a microservices architecture for video processing:

1. **Web Server (Next.js)**

   - Handles file uploads and client communication
   - Manages video metadata and user interactions
   - Integrates with CDN for content delivery

2. **RabbitMQ Message Broker**

   - Topic exchange for flexible routing
   - Quorum queues for high availability
   - In-memory limits for optimal performance
   - Durable message persistence

3. **Hermes Video Processing Server**
   - Go-based microservice for video processing
   - Features:
     - Thumbnail generation (poster frames)
     - Video preview sprites with WebVTT
     - Trailer generation with configurable settings
     - Concurrent task processing
     - FFmpeg-based video operations
   - Components:
     - Task Processor: Manages task lifecycle and distribution
     - Video Processor: Handles FFmpeg operations
     - Repository: Manages task state and persistence

### Video Processing Flow

1. **Upload Phase**

   - Client uploads video to web server
   - Web server saves video to shared volume
   - Creates task entries in PostgreSQL

2. **Task Distribution**

   - Web server publishes tasks to RabbitMQ
   - Uses `video/processing` exchange with `video.task.*` routing
   - Tasks include video metadata and processing parameters

3. **Processing Phase (Hermes)**

   - Consumes tasks from `video/tasks` queue
   - Updates task status to "processing"
   - Processes videos using FFmpeg:
     - Generates thumbnails
     - Creates preview sprites
     - Compiles video trailers
   - Updates task status on completion/failure

4. **Completion Phase**
   - Web server monitors task status
   - Updates UI with processing progress
   - Makes processed content available via CDN
   - Handles error cases and retries

### Task Message Format

```json
{
  "videoId": "unique-video-id",
  "filePath": "/path/to/video/file",
  "taskType": "poster|webvtt|trailer",
  "outputPath": "/path/to/output/directory",
  "config": {
    "webvtt": {
      "interval": 10,
      "numColumns": 5,
      "width": 160,
      "height": 90,
      "maxDuration": 3600
    },
    "trailer": {
      "clipDuration": 3,
      "clipCount": 10,
      "selectionStrategy": "uniform|random",
      "width": 1280,
      "height": 720,
      "targetDuration": 30
    }
  }
}
```

## 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/viewtubeapp/viewtube.git
   cd viewtube
   ```

2. **Install dependencies**

   ```bash
   npm install
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
   npm db:migrate

   # Start development server
   npm dev
   ```

5. **Access the application**
   - Web UI: http://localhost:3000

## 🎥 Video Processing Architecture

The application uses a microservices architecture for video processing:

1. **Web Server (Next.js)**

   - Handles file uploads and client communication
   - Manages video metadata and user interactions
   - Integrates with CDN for content delivery

2. **RabbitMQ Message Broker**

   - Topic exchange for flexible routing
   - Quorum queues for high availability
   - In-memory limits for optimal performance
   - Durable message persistence

3. **Hermes Video Processing Server**
   - Go-based microservice for video processing
   - Features:
     - Thumbnail generation (poster frames)
     - Video preview sprites with WebVTT
     - Trailer generation with configurable settings
     - Concurrent task processing
     - FFmpeg-based video operations
   - Components:
     - Task Processor: Manages task lifecycle and distribution
     - Video Processor: Handles FFmpeg operations
     - Repository: Manages task state and persistence

### Video Processing Flow

1. **Upload Phase**

   - Client uploads video to web server
   - Web server saves video to shared volume
   - Creates task entries in PostgreSQL

2. **Task Distribution**

   - Web server publishes tasks to RabbitMQ
   - Uses `video/processing` exchange with `video.task.*` routing
   - Tasks include video metadata and processing parameters

3. **Processing Phase (Hermes)**

   - Consumes tasks from `video/tasks` queue
   - Updates task status to "processing"
   - Processes videos using FFmpeg:
     - Generates thumbnails
     - Creates preview sprites
     - Compiles video trailers
   - Updates task status on completion/failure

4. **Completion Phase**
   - Web server monitors task status
   - Updates UI with processing progress
   - Makes processed content available via CDN
   - Handles error cases and retries

### Task Message Format

```json
{
  "videoId": "unique-video-id",
  "filePath": "/path/to/video/file",
  "taskType": "poster|webvtt|trailer",
  "outputPath": "/path/to/output/directory",
  "config": {
    "webvtt": {
      "interval": 10,
      "numColumns": 5,
      "width": 160,
      "height": 90,
      "maxDuration": 3600
    },
    "trailer": {
      "clipDuration": 3,
      "clipCount": 10,
      "selectionStrategy": "uniform|random",
      "width": 1280,
      "height": 720,
      "targetDuration": 30
    }
  }
}
```

## 🔧 Environment Variables

### Application Settings

| Variable              | Description                       | Required | Default |
| --------------------- | --------------------------------- | -------- | ------- |
| `UPLOADS_VOLUME`      | Path to the uploads volume        | Yes      | -       |
| `NEXT_PUBLIC_BRAND`   | Brand name for the application    | Yes      | -       |
| `NEXT_PUBLIC_URL`     | Public URL of the web application | Yes      | -       |
| `NEXT_PUBLIC_CDN_URL` | CDN URL for static assets         | Yes      | -       |

### Authentication (Authentik)

| Variable                       | Description                    | Required | Default |
| ------------------------------ | ------------------------------ | -------- | ------- |
| `AUTH_URL`                     | Sign in URL                    | Yes      | -       |
| `AUTH_TRUST_HOST`              | Trust host for Authentik       | Yes      | -       |
| `AUTHENTIK_SECRET_KEY`         | Secret key for Authentik       | Yes      | -       |
| `AUTHENTIK_AUTH_ISSUER`        | Authentik OAuth issuer URL     | Yes      | -       |
| `AUTHENTIK_AUTH_CLIENT_ID`     | OAuth client ID from Authentik | Yes      | -       |
| `AUTHENTIK_AUTH_CLIENT_SECRET` | OAuth client secret            | Yes      | -       |

### Database (PostgreSQL)

| Variable            | Description         | Required | Default |
| ------------------- | ------------------- | -------- | ------- |
| `POSTGRES_HOST`     | PostgreSQL host     | Yes      | -       |
| `POSTGRES_DB`       | Database name       | Yes      | -       |
| `POSTGRES_PORT`     | PostgreSQL port     | Yes      | 5432    |
| `POSTGRES_USER`     | PostgreSQL username | Yes      | -       |
| `POSTGRES_PASSWORD` | PostgreSQL password | Yes      | -       |

### Message Queue (RabbitMQ)

| Variable            | Description       | Required | Default |
| ------------------- | ----------------- | -------- | ------- |
| `RABBITMQ_HOST`     | RabbitMQ host     | Yes      | -       |
| `RABBITMQ_PORT`     | RabbitMQ port     | Yes      | 5672    |
| `RABBITMQ_USER`     | RabbitMQ username | Yes      | -       |
| `RABBITMQ_PASSWORD` | RabbitMQ password | Yes      | -       |

### Database Management (pgAdmin)

| Variable           | Description            | Required | Default |
| ------------------ | ---------------------- | -------- | ------- |
| `PGADMIN_EMAIL`    | pgAdmin admin email    | Yes      | -       |
| `PGADMIN_PASSWORD` | pgAdmin admin password | Yes      | -       |

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
   make hermes-build
   ```

4. **Deploy the stack**

   ```bash
   # Deploy the full stack
   make app-deploy

   # To stop the stack
   make app-stop
   ```

### Service Architecture

The application is composed of several microservices:

1. **Application Services** (`app.yaml`):

   - `web`: Next.js web application with automatic SSL/TLS
   - `hermes`: Go-based video processing service
   - Auto-scaling and rolling updates configured

2. **Proxy Services** (`proxy.yaml`):

   - `traefik`: Edge router and load balancer
   - `nginx`: Static file serving and CDN

3. **Database Services** (`database.yaml`):

   - `db`: PostgreSQL database
   - Persistent volume for data storage

4. **Message Queue** (`messaging.yaml`):

   - `rabbitmq`: Message broker for video processing
   - Configured with quorum queues

5. **Authentication** (`auth.yaml`):

   - `authentik`: Identity provider and SSO
   - Secure token management

6. **Monitoring** (`monitoring.yaml`):

   - `prometheus`: Metrics collection
   - `grafana`: Metrics visualization
   - `node-exporter`: System metrics
   - `cadvisor`: Container metrics

7. **Tools** (`tools.yaml`):
   - `pgadmin`: Database management
   - `portainer`: Container management

### Deployment Features

- Automatic SSL/TLS certificate management via Let's Encrypt
- Rolling updates with zero-downtime deployment
- Health checks and automatic container recovery
- Load balancing and request routing
- Persistent storage for data and uploads
- Comprehensive monitoring and logging
- Secure service communication

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

## 🛠️ Available Scripts

| Command                  | Description                            |
| ------------------------ | -------------------------------------- |
| **Development**          |                                        |
| `npm dev`               | Start development server with Turbo    |
| `npm build`             | Build for production                   |
| `npm start`             | Start production server                |
| `npm preview`           | Build and preview production           |
| `npm analyze`           | Analyze bundle size                    |
| `npm debug`             | Start development server in debug mode |
| **Database**             |                                        |
| `npm db:generate`       | Generate database migrations           |
| `npm db:migrate`        | Apply database migrations              |
| `npm db:push`           | Push schema changes to database        |
| `npm db:studio`         | Open Drizzle Studio                    |
| `npm db:seed`           | Seed database with sample data         |
| `npm db:reset`          | Reset database (without seeding)       |
| **Code Quality**         |                                        |
| `npm check`             | Run linting and type checking          |
| `npm format:ts`         | Format TypeScript files                |
| `npm format:go`         | Format Go files                        |
| `npm lint`              | Run ESLint                             |
| `npm lint:fix`          | Fix ESLint issues                      |
| `npm type-check`        | Run TypeScript type checking           |
| **Internationalization** |                                        |
| `npm intl:validate`     | Validate translation keys              |
| **Maintenance**          |                                        |
| `npm check-updates`     | Check for dependency updates           |

## 📦 Project Structure

```
.
├── src/                      # Application source code
│   ├── app/                 # Next.js app router pages and layouts
│   ├── components/          # Reusable React components
│   ├── constants/           # Application constants and enums
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core libraries and configurations
│   ├── paraglide/          # Internationalization (i18n) setup
│   ├── server/             # Server-side code and API routes
│   │   ├── api/           # tRPC API routes and procedures
│   │   ├── auth/          # Authentication configuration
│   │   ├── db/            # Database schema and utilities
│   │   └── queue/         # Message queue configuration
│   ├── styles/             # Global styles and Tailwind utilities
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Shared utility functions
├── @types/                  # Global TypeScript declarations
├── messages/                # Translation messages
├── project.inlang/          # i18n project configuration
├── drizzle/                 # Database migrations
├── .docker/                 # Docker-related files
│   ├── compose/            # Docker Compose service definitions
│   └── Dockerfile.*        # Service-specific Dockerfiles
├── .github/                 # GitHub workflows and configuration
├── scripts/                 # Utility scripts
├── public/                  # Static assets
├── config files            # Various configuration files
└── package.json            # Project dependencies and scripts
```

2. **Prettier**

   - Configured in `prettier.config.js`
   - Consistent code formatting
   - Format code:
     ```bash
     npm format
     ```

3. **PostCSS**
   - Configured in `postcss.config.js`
   - Integrates with Tailwind CSS
   - Handles CSS transformations

### Database Management

The project uses Drizzle ORM for database management:

1. **Create a migration**

   ```bash
   npm db:generate
   ```

2. **Apply migrations**

   ```bash
   npm db:migrate
   ```

3. **View migration status**
   ```bash
   npm db:status
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
