import Redis from "ioredis";
import { logger } from "./logger.config";
import config from "./index";
import { JobQueue } from "../queues";

const retryStrategy = (times: number): number => {
  const delay = Math.min(times * 200, 5000);

  logger.debug(`Redis reconnect attempt #${times}. Retrying in ${delay}ms`);

  return delay;
};

export const redis = new Redis(config.REDIS_URL, {
  lazyConnect: true,

  maxRetriesPerRequest: null,

  retryStrategy,

  reconnectOnError(error) {
    logger.error(`Redis reconnect error: ${error.message}`);

    return true;
  },
});

redis.on("connect", () => {
  logger.info("Redis connection established");
});

redis.on("ready", () => {
  logger.success("Redis client ready");
});

redis.on("error", (error) => {
  logger.error(error);
});

redis.on("close", () => {
  logger.info("Redis connection closed");
});

redis.on("reconnecting", () => {
  logger.debug("Redis reconnecting...");
});

redis.on("end", () => {
  logger.info("Redis connection ended");
});

process.on("SIGINT", async () => {
  logger.info("Closing Redis connection...");

  await redis.quit();

  logger.success("Redis connection closed successfully");
  await JobQueue.closeAllQueues();
  await redis.quit();

  process.exit(0);
});
