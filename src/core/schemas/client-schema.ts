import { ID_LENGTH } from "@trustify/utils/constants";
import { z } from "zod";

export const ClientIdParamSchema = z.object({
  clientid: z.string().length(ID_LENGTH),
});
