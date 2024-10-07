import { logger } from "hono/logger";
import { authorizationHandler } from "@trustify/core/handlers/authorization";
import { discoveryHandler } from "@trustify/core/handlers/discovery";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { notFound } from "@trustify/core/middlewares/not-found";
import { onError } from "@trustify/core/middlewares/on-error";
import { testHander } from "@trustify/core/handlers/test";

const app = new Hono().basePath("/api");

app.use(logger());

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
