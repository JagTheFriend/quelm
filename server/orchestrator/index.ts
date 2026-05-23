import { AgentType, PrismaClient } from "@prisma/client";
import { QueueEvents } from "bullmq";
import { redis } from "../config/redis.config";
import { logger } from "../config/logger.config";

const agentTypes: AgentType[] = [
  AgentType.EXTRACTION_AGENT,
  AgentType.HTTP_AGENT,
  AgentType.LLM_AGENT,
  AgentType.NOTIFICATION_AGENT,
  AgentType.STORAGE_AGENT,
  AgentType.TRANSFORM_AGENT,
];

export class Orchestrator {
  private queueEventsInstances: QueueEvents[] = [];

  constructor(public readonly prisma: PrismaClient) {}

  public start = async () => {
    for (const agentType of agentTypes) {
      const queueEventInstance = new QueueEvents(agentType, { connection: redis });

      queueEventInstance.on("completed", ({ jobId }) => {
        logger.success(`Event completed ${jobId}`);
        this.onTaskCompleted(jobId);
      });

      queueEventInstance.on("failed", ({ jobId, failedReason }) => {
        logger.error(`Event failed ${jobId}, reason: ${failedReason}`);
        this.onTaskFailed(jobId, failedReason);
      });

      this.queueEventsInstances.push(queueEventInstance);
    }
  };

  public stop = async () => {
    logger.info("Closing all events");

    await Promise.all(
      Array.from(this.queueEventsInstances.values()).map((queueEventInstance) =>
        queueEventInstance.close(),
      ),
    );

    logger.success("All events closed");
  };

  private onTaskCompleted = async (jobId: string): Promise<void> => {};
  private onTaskFailed = async (jobId: string, reason: string): Promise<void> => {};
}
