import { Hono } from "hono";

export const authorizationHandler = new Hono().get("/");
