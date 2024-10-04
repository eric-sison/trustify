import { Redis } from "ioredis";
import { appConfig } from "./environment";

export const redisStore = new Redis(appConfig.redisPort, appConfig.redisHost, {
  password: appConfig.redisPassword,
  enableReadyCheck: true,
  maxRetriesPerRequest: 5,
  retryStrategy: (times) => Math.min(times * 50, 500),
});

// TODO: add production logger
redisStore.on("error", (err) => console.error(err));
