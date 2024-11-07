import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { Hono } from "hono";
import { requireAuth } from "../middlewares/require-auth";
import { ClientService } from "../services/client-service";
import { zValidator } from "@hono/zod-validator";
import { ClientIdParamSchema } from "../schemas/client-schema";

export const clientsHandler = new Hono<HonoAppBindings>()
  .get("/", requireAuth, async (c) => {
    const clientService = new ClientService();

    const clients = await clientService.getAllClients();

    return c.json(clients);
  })

  .get("/:clientid", requireAuth, zValidator("param", ClientIdParamSchema), async (c) => {
    const { clientid } = c.req.valid("param");

    const clientService = new ClientService();

    const client = await clientService.getClientById(clientid);

    return c.json(client);
  });
