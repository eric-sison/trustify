import { AppType } from "@trustify/app/api/[[...route]]/route";
import { validateEnv } from "@trustify/utils/validate-env";
import { hc } from "hono/client";
import { z } from "zod";

const adminHost = process.env.NEXT_PUBLIC_ADMIN_HOST!;

const parsedEnv = validateEnv(adminHost, z.string().url());

export const rpcClient = hc<AppType>(parsedEnv);
