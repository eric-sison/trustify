import { authorizationHandler } from "@trustify/core/handlers/authorization";
import { discoveryHandler } from "@trustify/core/handlers/discovery";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { notFound } from "@trustify/core/middlewares/not-found";
import { onError } from "@trustify/core/middlewares/on-error";
import { pinoLogger } from "@trustify/core/middlewares/pino-logger";
import { PinoLogger } from "hono-pino";
import { authenticationHandler } from "@trustify/core/handlers/authentication";
import { DatabaseUserAttributes } from "@trustify/config/lucia";
import { Session } from "lucia";
import { tokenHandler } from "@trustify/core/handlers/token";
import { keystoreHandler } from "@trustify/core/handlers/keystore";
import { userInfoHandler } from "@trustify/core/handlers/userinfo";
import { cors } from "hono/cors";
import { Environment } from "@trustify/config/environment";
import { usersHandler } from "@trustify/core/handlers/users";
import { clientsHandler } from "@trustify/core/handlers/clients";

export type HonoAppBindings = {
  Variables: {
    logger: PinoLogger;
    user: DatabaseUserAttributes;
    session: Session;
    requireAuth: boolean;
  };
};

const app = new Hono<HonoAppBindings>().basePath("/api");

const appConfig = Environment.getPublicConfig();

app.use(
  cors({
    credentials: true,
    origin: [appConfig.adminHost, "https://trustify.gscwd.app"],
    allowHeaders: ["Origin", "Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

app.use(pinoLogger());

app.notFound(notFound);

app.onError(onError);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/v1/.well-known", discoveryHandler)
  .route("/v1/authorization", authorizationHandler)
  .route("/v1/userinfo", userInfoHandler)
  .route("/v1/oidc", authenticationHandler)
  .route("/v1/token", tokenHandler)
  .route("/v1/keystore", keystoreHandler)
  .route("/v1/users", usersHandler)
  .route("/v1/clients", clientsHandler);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
