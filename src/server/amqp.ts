import "server-only";
import { env } from "@/env";
import amqplib, { type Channel, type Connection } from "amqplib";
import { promises as fs } from "fs";
import { match, P } from "ts-pattern";
import { log } from "@/server/logger";
import { AMQP } from "@/constants/amqp";

const context = globalThis as unknown as {
  pubChannel: Channel | undefined;
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
  await channel.assertExchange(AMQP.exchange, "topic", { durable: true });

  // Declare tasks queue with quorum settings
  await channel.assertQueue(AMQP.queues.tasks, {
    durable: true,
    arguments: {
      "x-queue-type": "quorum",
      "x-max-in-memory-length": 100,
    },
  });

  // Bind queue to exchange with task routing key
  await channel.bindQueue(AMQP.queues.tasks, AMQP.exchange, AMQP.routingKeys.task);

  return channel;
}

async function setupChannel(retryCount = 0, maxRetries = 5) {
  try {
    const conn = await createConnection();
    const channel = await createChannel(conn);

    conn.on("error", (err: Error) => {
      log.error("RabbitMQ connection error: %o", err);
      context.pubChannel = undefined;
    });

    conn.on("close", () => {
      log.warn("RabbitMQ connection closed");
      context.pubChannel = undefined;
    });

    channel.on("error", (err: Error) => {
      log.error("RabbitMQ channel error: %o", err);
      context.pubChannel = undefined;
    });

    channel.on("close", () => {
      log.warn("RabbitMQ channel closed");
      context.pubChannel = undefined;
    });

    return channel;
  } catch (err) {
    if (retryCount < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      return setupChannel(retryCount + 1, maxRetries);
    }

    throw err;
  }
}

// Initialize channel
const pub = setupChannel();

if (env.NODE_ENV !== "production") {
  void pub.then((channel) => {
    context.pubChannel = channel;
  });
}

export const amqp = { pub } as const;
