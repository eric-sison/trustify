import { oidcDiscovery } from "@trustify/config/oidc-discovery";
import { Hono } from "hono";

export const discoveryHandler = new Hono().get("/", async (c) => {
  return c.json(oidcDiscovery);
});
