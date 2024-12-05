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

```
UPLOADS_VOLUME=       # Directory for video uploads
POSTGRES_HOST=        # PostgreSQL host
POSTGRES_DB=          # PostgreSQL database name
POSTGRES_PORT=        # PostgreSQL port
POSTGRES_USER=        # PostgreSQL user
POSTGRES_PASSWORD=    # PostgreSQL password
RABBITMQ_HOST=        # RabbitMQ host
RABBITMQ_PORT=        # RabbitMQ port
RABBITMQ_USER=        # RabbitMQ user
RABBITMQ_PASSWORD=    # RabbitMQ password
```

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
3. **Subscriber**: Listens for task completions and updates the database

### RabbitMQ Architecture

The system uses a topic exchange architecture with the following components:

- **Exchange**: `video/processing` (type: topic)
- **Queues**:
  - `video/tasks.worker` - For processing video tasks (quorum queue for high availability)
  - `video/completions` - For handling task completion events
- **Routing Keys**:
  - `video.task.*` - For routing video processing tasks
  - `video.completion.#` - For routing task completion events

Each task message should have the following JSON structure:

```json
{
  "videoId": "unique-video-id",
  "filePath": "/path/to/video/file",
  "taskType": "poster|webvtt|trailer",
  "outputPath": "/path/to/output/directory",
  "config": {
    "webvtt": { ... }  // Optional configuration for WebVTT tasks
  }
}
```

Task completion notifications have the following structure:

```json
{
  "videoId": "unique-video-id",
  "taskType": "poster|webvtt|trailer",
  "filePath": "/path/to/video/file",
  "outputPath": "/path/to/output/file",
  "status": "completed|failed",
  "error": "error message" // Only present if status is "failed"
}
```

## Task Types

- `poster`: Creates a thumbnail image from the video
- `webvtt`: Generates sprite images and WebVTT file for video preview
- `trailer`: Creates a 30-second trailer from the video

## Integration with Next.js

Use a RabbitMQ client in your Next.js application to publish tasks and subscribe to completions. Example using `amqplib`:

```typescript
import amqp from "amqplib";

const connection = await amqp.connect(process.env.RABBITMQ_URL);
const channel = await connection.createChannel();

// Declare exchange
await channel.assertExchange("video/processing", "topic", { durable: true });

// Declare queues
await channel.assertQueue("video/tasks.worker", {
  durable: true,
  arguments: { "x-queue-type": "quorum" },
});
await channel.assertQueue("video/completions", { durable: true });

// Bind queues to exchange
await channel.bindQueue("video/tasks.worker", "video/processing", "video.task.*");
await channel.bindQueue("video/completions", "video/processing", "video.completion.#");

// Publish a task
await channel.publish(
  "video/processing",
  "video.task.poster",
  Buffer.from(
    JSON.stringify({
      videoId: "unique-video-id",
      filePath: "/path/to/video.mp4",
      taskType: "poster",
      outputPath: "/path/to/output",
    }),
  ),
);

// Subscribe to completions
channel.consume("video/completions", (message) => {
  if (message) {
    const completion = JSON.parse(message.content.toString());
    console.log("Task completed:", completion);
    channel.ack(message);
  }
});

// Clean up on application shutdown
process.on("SIGINT", async () => {
  await channel.close();
  await connection.close();
});
```

## Error Handling

The server implements retry logic for failed tasks with configurable parameters:

- Maximum number of retries
- Base delay between retries (with exponential backoff)
- Task timeout duration

Failed tasks are requeued with exponential backoff until the maximum retry count is reached. After all retries are exhausted, a failure notification is published to the completion queue.
