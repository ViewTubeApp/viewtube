import { env } from "@/env";
import amqplib, { type Channel, type Connection } from "amqplib";
import { promises as fs } from "fs";
import { match, P } from "ts-pattern";
import { log } from "@/server/logger";

const context = globalThis as unknown as {
  pubChannel: Channel | undefined;
  subChannel: Channel | undefined;
};

async function createConnection() {
  const password = await match(env.RABBITMQ_PASSWORD_FILE)
    .with(P.nullish, () => env.RABBITMQ_PASSWORD)
    .with(P.string, async (file) => (await fs.readFile(file, "utf-8")).trim())
    .exhaustive();

  return amqplib.connect({
    password,
    hostname: env.RABBITMQ_HOST,
    port: parseInt(env.RABBITMQ_PORT),
    username: env.RABBITMQ_USER,
  });
}

async function createChannel(conn: Connection) {
  const channel = await conn.createChannel();

  // Declare exchange for video processing
  await channel.assertExchange("video/processing", "topic", { durable: true });

  // Declare queues with quorum type for better HA
  await channel.assertQueue("video/tasks", { durable: true });
  await channel.assertQueue("video/completions", { durable: true });

  // Bind queues to exchange with specific routing patterns
  // video.task.{taskType} - for better message distribution
  await channel.bindQueue("video/tasks", "video/processing", "video.task.*");
  // video.completion.{videoId}.{taskType} - for completion tracking
  await channel.bindQueue("video/completions", "video/processing", "video.completion.#");

  return channel;
}

async function setupChannel() {
  try {
    const conn = await createConnection();
    const channel = await createChannel(conn);

    conn.on("error", (err: Error) => {
      log.error("RabbitMQ connection error: %o", err);
      context.pubChannel = undefined;
      context.subChannel = undefined;
    });

    conn.on("close", () => {
      log.warn("RabbitMQ connection closed");
      context.pubChannel = undefined;
      context.subChannel = undefined;
    });

    channel.on("error", (err: Error) => {
      log.error("RabbitMQ channel error: %o", err);
      context.pubChannel = undefined;
      context.subChannel = undefined;
    });

    channel.on("close", () => {
      log.warn("RabbitMQ channel closed");
      context.pubChannel = undefined;
      context.subChannel = undefined;
    });

    return channel;
  } catch (err) {
    log.error("Failed to setup RabbitMQ: %o", err);
    throw err;
  }
}

// Initialize channels
const pub = setupChannel();
const sub = setupChannel();

if (env.NODE_ENV !== "production") {
  void pub.then((channel) => {
    context.pubChannel = channel;
  });
  void sub.then((channel) => {
    context.subChannel = channel;
  });
}

export const amqp = { pub, sub } as const;
