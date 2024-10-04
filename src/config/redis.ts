import { Redis } from "ioredis";

export const redisStore = new Redis(6379, "", {
  password: "",
  enableReadyCheck: true,
  maxRetriesPerRequest: 5,
  retryStrategy: (times) => Math.min(times * 50, 500),
});

// TODO: add production logger
redisStore.on("error", (err) => console.log(err));
