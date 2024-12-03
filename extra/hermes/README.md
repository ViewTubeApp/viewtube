# Hermes Video Processing Server

A Go-based video processing server that handles video tasks concurrently using Redis pub/sub for communication.

## Prerequisites

- Go 1.21 or later
- Redis server
- FFmpeg installed on the system

## Setup

1. Copy `.env.example` to `.env` and adjust settings if needed:

```bash
cp .env.example .env
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

The server listens for video processing tasks on the Redis pub/sub channel `video_tasks`. Each task should be a JSON message with the following structure:

```json
{
  "filePath": "/path/to/video/file",
  "taskType": "poster|webvtt|trailer",
  "outputPath": "/path/to/output/directory"
}
```

After processing, the server publishes completion notifications to the `video_completions` channel with the following structure:

```json
{
  "taskType": "poster|webvtt|trailer",
  "filePath": "/path/to/video/file",
  "outputPath": "/path/to/output/file",
  "status": "completed"
}
```

## Task Types

- `poster`: Creates a thumbnail image from the video
- `webvtt`: Generates sprite images and WebVTT file for video preview
- `trailer`: Creates a 30-second trailer from the video

## Integration with Next.js

Use a Redis client in your Next.js application to publish tasks and subscribe to completions. Example using Redis client:

```typescript
const redis = new Redis(process.env.REDIS_URL);

// Publish a task
await redis.publish(
  "video_tasks",
  JSON.stringify({
    filePath: "/path/to/video.mp4",
    taskType: "poster",
    outputPath: "/path/to/output",
  }),
);

// Subscribe to completions
redis.subscribe("video_completions", (err, count) => {
  if (err) console.error("Failed to subscribe:", err.message);
});

redis.on("message", (channel, message) => {
  const completion = JSON.parse(message);
  console.log("Task completed:", completion);
});
```
