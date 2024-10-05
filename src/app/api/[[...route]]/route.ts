import { authorizationHandler } from "@trustify/core/handlers/authorization";
import { discoveryHandler } from "@trustify/core/handlers/discovery";
import { Hono } from "hono";
import { handle } from "hono/vercel";

export const app = new Hono().basePath("/api");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/v1/.well-known/openid-configuration", discoveryHandler)
  .route("/v1/authorization", authorizationHandler);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
