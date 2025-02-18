# Hermes Video Processing Server

A Go-based video processing server that handles video tasks concurrently using RabbitMQ for message queuing and PostgreSQL for data persistence.

## 🚀 Features

- **Video Processing**

  - FFmpeg-based video operations
  - Thumbnail generation (poster frames)
  - Video preview sprites with WebVTT
  - Trailer generation with configurable settings
  - Concurrent task processing

- **Task Management**

  - RabbitMQ message queuing
  - Topic-based routing
  - Quorum queues for high availability
  - Configurable task timeouts and retries
  - Graceful shutdown handling

- **Infrastructure**
  - PostgreSQL for task persistence
  - Connection management for RabbitMQ and PostgreSQL
  - Health checks and monitoring
  - Resource cleanup on shutdown
  - Docker-ready deployment

## 📋 Prerequisites

- Go 1.21 or later
- RabbitMQ server
- PostgreSQL database
- FFmpeg installed on the system

## 🛠️ Setup

1. **Configure Environment**

   ```bash
   cp .env.example .env
   ```

   Required environment variables:

   ### General

   | Variable         | Description                | Required | Default |
   | ---------------- | -------------------------- | -------- | ------- |
   | `UPLOADS_VOLUME` | Path to the uploads volume | Yes      | -       |

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

2. **Install Dependencies**

   ```bash
   go mod download
   ```

3. **Run Server**

   ```bash
   go run main.go
   ```

## 🏗️ Architecture

The server uses a modular architecture with the following components:

1. **Application Core (`app`)**

   - Manages application lifecycle
   - Handles graceful shutdown
   - Coordinates component initialization
   - Manages resource cleanup

2. **Connection Management**

   - `amqp.Manager`: RabbitMQ connection handling
   - `database.Manager`: PostgreSQL connection handling
   - Connection pooling and retry logic
   - Graceful connection cleanup

3. **Task Processing**

   - `worker.TaskProcessor`: Manages task execution
   - Configurable task timeouts
   - Retry mechanism with backoff
   - Task status tracking

4. **Video Processing**

   - `video.FFmpegProcessor`: Handles video operations
   - Thumbnail generation
   - Sprite generation for previews
   - Trailer compilation

5. **Data Management**
   - `repository.VideoRepository`: Task state persistence
   - Status tracking and updates
   - Task metadata management

### 🐰 RabbitMQ Architecture

The system uses a topic exchange architecture:

- **Exchange**: `video/processing` (type: topic, durable)
- **Queues**:
  - `video/tasks` - For processing video tasks (quorum queue with in-memory limits)
- **Routing Keys**:
  - `video.task.*` - For routing video processing tasks

### 📝 Task Message Format

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

### 🔄 Processing Flow

1. Application startup:

   - Initialize configuration
   - Connect to RabbitMQ and PostgreSQL
   - Set up video processor and repository
   - Start task processor

2. Task processing:

   - Consume messages from RabbitMQ queue
   - Update task status in database
   - Process video using FFmpeg
   - Handle success/failure states
   - Manage retries if configured

3. Graceful shutdown:
   - Capture shutdown signals (SIGINT/SIGTERM)
   - Stop accepting new tasks
   - Complete in-progress tasks
   - Clean up resources and connections

### ⚡ Task Types

- `poster`: Creates a thumbnail image from the video
- `webvtt`: Generates sprite images and WebVTT file for video preview
- `trailer`: Creates a trailer from the video

### 🛡️ Error Handling

- Connection retry logic for RabbitMQ and PostgreSQL
- Task timeout handling
- Configurable retry mechanism with backoff
- Resource cleanup on errors
- Graceful shutdown support

## 🔗 Integration Example

```typescript
import amqp from "amqplib";

const connection = await amqp.connect(process.env.RABBITMQ_URL);
const channel = await connection.createChannel();

// Declare exchange
await channel.assertExchange("video/processing", "topic", { durable: true });

// Declare queues
await channel.assertQueue("video/tasks", {
  durable: true,
  arguments: { "x-queue-type": "quorum" },
});

// Bind queues to exchange
await channel.bindQueue("video/tasks", "video/processing", "video.task.*");

// Publish a task
await channel.publish(
  "video/processing",
  `video.task.${videoId}`,
  Buffer.from(
    JSON.stringify({
      videoId: "unique-video-id",
      filePath: "/path/to/video.mp4",
      taskType: "poster",
      outputPath: "/path/to/output",
      config: {
        webvtt: {
          interval: 10,
          numColumns: 5,
          width: 160,
          height: 90,
        },
      },
    }),
  ),
);

// Clean up on application shutdown
process.on("SIGINT", async () => {
  await channel.close();
  await connection.close();
});
```
