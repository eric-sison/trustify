import { Hono } from "hono";

export const testHander = new Hono().get("/", async () => {
  throw new Error("Something went wrong!");
});
