import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { KeyStoreService } from "@trustify/core/services/keystore-service";
import { KeyStoreRepository } from "@trustify/core/repositories/keystore-repository";
import { Hono } from "hono";

// TODO: this route should only be accessible by authenticated user and role = admin
export const keystoreHandler = new Hono<HonoAppBindings>().post("/rotate-keys", async (c) => {
  const keyStoreService = new KeyStoreService(new KeyStoreRepository());

  const key = await keyStoreService.createKey();

  return c.json(key);
});
