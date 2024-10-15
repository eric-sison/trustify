import { Redis } from "ioredis";
import { Environment } from "./environment";

const serverConfig = Environment.getServerConfig();

export const redisStore = new Redis(serverConfig.redisPort, serverConfig.redisHost, {
  password: serverConfig.redisPassword,
  enableReadyCheck: true,
  maxRetriesPerRequest: 5,
  retryStrategy: (times) => Math.min(times * 50, 500),
});

redisStore.on("error", (err) => console.error(err));
