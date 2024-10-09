import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { Hono } from "hono";
import { KeyStoreService } from "../services/keystore-service";
import { KeyStoreRepository } from "../repositories/keystore-repository";

// TODO: this route should only be accessible by authenticated user and role = admin
export const keystoreHandler = new Hono<HonoAppBindings>().post("/rotate-keys", async (c) => {
  const keyStoreService = new KeyStoreService(new KeyStoreRepository());

  const key = await keyStoreService.createKey();

  return c.json(key);
});
