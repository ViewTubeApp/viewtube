// RabbitMQ configuration constants
export const AMQP = {
  exchange: "video/processing",
  queues: { tasks: "video/tasks" },
  routingKeys: { task: "video.task.*" },
} as const;
