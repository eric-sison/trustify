import { authorizationHandler } from "@trustify/core/handlers/authorization";
import { discoveryHandler } from "@trustify/core/handlers/discovery";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { notFound } from "@trustify/core/middlewares/not-found";
import { onError } from "@trustify/core/middlewares/on-error";
import { testHander } from "@trustify/core/handlers/test";
import { pinoLogger } from "@trustify/core/middlewares/pino-logger";
import { PinoLogger } from "hono-pino";

export type HonoAppBindings = {
  Variables: {
    logger: PinoLogger;
  };
};

const app = new Hono<HonoAppBindings>().basePath("/api");

app.use(pinoLogger());

app.notFound(notFound);

app.onError(onError);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/v1/.well-known/openid-configuration", discoveryHandler)
  .route("/v1/authorization", authorizationHandler)
  .route("/v1/test", testHander);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
