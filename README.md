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
- User authentication
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
  - [Prisma](https://prisma.io) - Type-safe ORM
  - [Drizzle](https://orm.drizzle.team) - TypeScript ORM
  - [PostgreSQL](https://www.postgresql.org/) - Database
  - [Redis](https://redis.io) - Message broker & caching
  - [FFmpeg](https://ffmpeg.org/) - Video processing
  - [Hermes](extra/hermes) - Go-based video processing server

- **Infrastructure:**
  - [Docker Swarm](https://docs.docker.com/engine/swarm/) - Container Orchestration
  - [Traefik](https://traefik.io/) - Edge Router & Load Balancer
  - [Nginx](https://nginx.org/) - Static file serving & CDN
  - [Make](https://www.gnu.org/software/make/) - Build automation

## 📋 Prerequisites

- Node.js 20.18.1 or later
- pnpm 9.14.2 or later
- Docker with Swarm mode enabled
- FFmpeg (for video processing)
- GNU Make
- Go 1.21 or later (for Hermes development)
- Redis 7.0 or later

## 🎥 Video Processing Architecture

The application uses a microservices architecture for video processing:

1. **Web Server (Next.js)**: Handles file uploads and client communication
2. **Redis**: Acts as a message broker between services
3. **Hermes**: Go-based video processing server that:
   - Generates video thumbnails
   - Creates preview sprites with WebVTT
   - Produces video trailers
   - Processes videos concurrently

### Video Processing Flow

1. Client uploads video to web server
2. Web server:
   - Saves video to disk
   - Publishes processing tasks to Redis
3. Hermes:
   - Subscribes to Redis for new tasks
   - Processes videos using FFmpeg
   - Publishes completion events
4. Web server:
   - Updates UI based on completion events
   - Makes processed content available via CDN

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

| Variable                 | Description                       | Required | Default |
| ------------------------ | --------------------------------- | -------- | ------- |
| `NEXT_PUBLIC_URL`        | Public URL of the web application | Yes      | -       |
| `NEXT_PUBLIC_BRAND`      | Brand name for the application    | Yes      | -       |
| `NEXT_PUBLIC_CDN_URL`    | CDN URL for static assets         | Yes      | -       |
| `POSTGRES_HOST`          | PostgreSQL host                   | Yes      | -       |
| `POSTGRES_PORT`          | PostgreSQL port                   | Yes      | 5432    |
| `POSTGRES_DB`            | PostgreSQL database name          | Yes      | -       |
| `POSTGRES_USER`          | PostgreSQL username               | Yes      | -       |
| `POSTGRES_PASSWORD_FILE` | Path to PostgreSQL password file  | Yes      | -       |
| `REMOTE_HOST`            | Remote host for deployment        | No       | -       |
| `CDN_HOST`               | CDN host for static assets        | No       | -       |
| `CODENAME`               | Project codename for deployment   | No       | -       |
| `REDIS_HOST`             | Redis server host                 | Yes      | -       |
| `REDIS_PORT`             | Redis server port                 | Yes      | 6379    |
| `REDIS_PASSWORD`         | Redis password                    | No       | -       |
| `REDIS_PASSWORD_FILE`    | Path to Redis password file       | No       | -       |

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

## 🛠️ Available Make Commands

| Command               | Description                               |
| --------------------- | ----------------------------------------- |
| `make help`           | Show available commands                   |
| `make all-build`      | Build all Docker images                   |
| `make web-build`      | Build web application Docker image        |
| `make nginx-build`    | Build Nginx Docker image                  |
| `make hermes-build`   | Build Hermes Go server Docker image       |
| `make docker-push`    | Push images to registry                   |
| `make docker-pull`    | Pull images from registry                 |
| `make docker-publish` | Build and push all images                 |
| `make app-deploy`     | Deploy application stack                  |
| `make app-stop`       | Stop application stack                    |
| `make dev-db`         | Start PostgreSQL for development          |
| `make dev-redis`      | Start Redis server for development        |
| `make dev-nginx`      | Start Nginx for development               |
| `make hermes-start`   | Run Hermes Go server with hot reload      |
| `make env-local`      | Switch to local Docker context            |
| `make env-remote`     | Switch to remote Docker context           |
| `make env-setup`      | Setup remote Docker context               |
| `make dev`            | Run all development services concurrently |

## 📦 Project Structure

```
.
├── src/              # Application source code
├── prisma/           # Database schema and migrations
├── public/           # Static assets
├── docker/           # Docker configuration
├── scripts/          # Utility scripts
├── drizzle/          # Database migrations
├── Makefile         # Build and deployment automation
├── compose.yaml     # Docker Swarm composition
├── nginx.conf       # Nginx configuration
└── config/          # Configuration files
    ├── next.config.ts        # Next.js configuration
    ├── drizzle.config.ts     # Drizzle ORM configuration
    ├── tailwind.config.ts    # Tailwind CSS configuration
    ├── postcss.config.js     # PostCSS configuration
    ├── prettier.config.js    # Prettier configuration
    ├── tsconfig.json         # TypeScript configuration
    └── .eslintrc.cjs        # ESLint configuration
```

## 🛠️ Development Setup

### TypeScript Configuration

The project uses TypeScript for type safety. Configuration is in `tsconfig.json` with:

- Strict type checking
- Next.js specific settings
- Path aliases for clean imports

### Code Quality Tools

1. **ESLint**

   - Configured in `.eslintrc.cjs`
   - Includes Next.js and TypeScript specific rules
   - Run linting:
     ```bash
     pnpm lint
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
