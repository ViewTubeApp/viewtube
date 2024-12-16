# Hermes Video Processing Server

A Go-based video processing server that handles video tasks concurrently using RabbitMQ for message queuing and PostgreSQL for data persistence.

## Prerequisites

- Go 1.21 or later
- RabbitMQ server
- PostgreSQL database
- FFmpeg installed on the system

## Setup

1. Copy `.env.example` to `.env` and configure the following settings:

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

2. Install dependencies:

```bash
go mod download
```

3. Run the server:

```bash
go run main.go
```

## Architecture

The server uses RabbitMQ for message queuing and PostgreSQL for data persistence. It consists of three main components:

1. **Task Processor**: Handles video processing tasks from RabbitMQ queues
2. **Video Processor**: Manages FFmpeg operations for video processing
3. **Repository**: Manages task state and database operations

### RabbitMQ Architecture

The system uses a topic exchange architecture with the following components:

- **Exchange**: `video/processing` (type: topic, durable)
- **Queues**:
  - `video/tasks` - For processing video tasks (quorum queue with in-memory limits)
- **Routing Keys**:
  - `video.task.*` - For routing video processing tasks

Each task message should have the following JSON structure:

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

### Task Processing Flow

1. Tasks are published to the `video/processing` exchange with the `video.task.*` routing key
2. The task processor consumes messages from the `video/tasks` queue
3. For each task:
   - Task status is set to "processing" in the database
   - The appropriate video processor is called based on task type
   - On completion/failure, task status is updated in the database
   - If all tasks for a video are complete/failed, video status is updated

### Error Handling and Task Tracking

The server implements robust error handling and task tracking:

- Database-backed task status tracking
- Automatic task status updates
- Video status updates based on task completion states
- Configurable task processing parameters:
  - Task timeout duration
  - QoS settings for parallel processing (prefetch count)
  - Quorum queue settings for high availability

Failed tasks are marked as failed in the database with detailed error information. The video status is updated to "failed" if any task fails, or "completed" when all tasks succeed.

## Task Types

- `poster`: Creates a thumbnail image from the video
- `webvtt`: Generates sprite images and WebVTT file for video preview with configurable sprite intervals and dimensions
- `trailer`: Creates a trailer from the video with configurable clip selection and duration

## Integration with Next.js

Use a RabbitMQ client in your Next.js application to publish tasks. Example using `amqplib`:

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
