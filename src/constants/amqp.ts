// RabbitMQ configuration constants
export const RABBITMQ = {
  exchange: "video/processing",
  queues: {
    tasks: "video/tasks",
    completions: "video/completions",
  },
  routingKeys: {
    task: "video.task.*",
    completion: "video.completion",
  },
} as const;
