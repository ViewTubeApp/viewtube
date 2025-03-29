```
  _    ___              ______      __
 | |  / (_)__ _      __/_  __/_  __/ /_  ___
 | | / / / _ \ | /| / // / / / / / __ \/ _ \
 | |/ / /  __/ |/ |/ // / / /_/ / /_/ /  __/
 |___/_/\___/|__/|__//_/  \__,_/_.___/\___/
```

A modern video streaming platform built with the T3 Stack, designed to run on Docker Swarm.

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

## 🛠️ Tech Stack

- **Frontend:**

  - [Next.js 15](https://nextjs.org) - React framework for production
  - [React 19](https://react.dev) - UI library with latest features
  - [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS framework
  - [tRPC 11](https://trpc.io) - End-to-end typesafe APIs
  - [Vidstack](https://vidstack.io) - Media player components

- **Backend:**

  - [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM
  - [Clerk](https://clerk.com/) - User Authentication

- **Infrastructure:**
  - [Docker Swarm](https://docs.docker.com/engine/swarm/) - Container Orchestration
  - [Traefik](https://traefik.io/) - Edge Router & Load Balancer
  - [PostHog](https://posthog.com/) - Web Analytics

## 📋 Prerequisites

- Node.js 22.13.1 or later
- Bun 1.2.5 or later
- GNU Make

## 🎥 Video Processing Architecture

The application uses a microservices architecture for video processing:

1. **Web Server (Next.js)**

   - Handles file uploads and client communication
   - Manages video metadata and user interactions
   - Integrates with CDN for content delivery

## 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/viewtubeapp/viewtube.git
   cd viewtube
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration (see Environment Variables section below)

4. **Start development environment**

   ```bash
   bun run dev
   ```

5. **Access the application**
   - Web UI: http://localhost:3000

## 🔧 Environment Variables

### Application Settings

| Variable                      | Description                       | Required | Default |
| ----------------------------- | --------------------------------- | -------- | ------- |
| `NEXT_PUBLIC_URL`             | Public URL of the web application | Yes      | -       |
| `NEXT_PUBLIC_BRAND`           | Brand name for the application    | Yes      | -       |
| `NEXT_PUBLIC_NODE_ENV`        | Next.js environment               | No       | -       |
| `NEXT_PUBLIC_GIT_COMMIT_HASH` | Git commit hash                   | No       | -       |

### Server

| Variable          | Description            | Required | Default |
| ----------------- | ---------------------- | -------- | ------- |
| `ANALYZE`         | Enable bundle analysis | No       | -       |
| `NODE_ENV`        | Node environment       | No       | -       |
| `GIT_COMMIT_HASH` | Git commit hash        | No       | -       |

### Task Runner (Trigger.dev)

| Variable               | Description                                       | Required | Default |
| ---------------------- | ------------------------------------------------- | -------- | ------- |
| `TRIGGER_SECRET_KEY`   | Trigger.dev API key                               | Yes      | -       |
| `TRIGGER_ACCESS_TOKEN` | Trigger.dev access token (used in GitHub Actions) | Yes      | -       |

### Analytics (PostHog)

| Variable                   | Description                | Required | Default |
| -------------------------- | -------------------------- | -------- | ------- |
| `NEXT_PUBLIC_POSTHOG_KEY`  | PostHog key for analytics  | Yes      | -       |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host for analytics | Yes      | -       |

### UploadThing

| Variable                         | Description        | Required | Default |
| -------------------------------- | ------------------ | -------- | ------- |
| `UPLOADTHING_TOKEN`              | UploadThing token  | Yes      | -       |
| `NEXT_PUBLIC_UPLOADTHING_APP_ID` | UploadThing app ID | Yes      | -       |

### Authentication (Clerk)

| Variable                            | Description               | Required | Default |
| ----------------------------------- | ------------------------- | -------- | ------- |
| `CLERK_SECRET_KEY`                  | Secret key for Clerk      | Yes      | -       |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Publishable key for Clerk | Yes      | -       |

### Database (PlanetScale)

| Variable            | Description          | Required | Default |
| ------------------- | -------------------- | -------- | ------- |
| `DATABASE_HOST`     | PlanetScale host     | Yes      | -       |
| `DATABASE_URL`      | PlanetScale URL      | No       | -       |
| `DATABASE_USERNAME` | PlanetScale username | Yes      | -       |
| `DATABASE_PASSWORD` | PlanetScale password | Yes      | -       |

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
