import { OidcError } from "@trustify/core/types/oidc-error";
import { ErrorHandler } from "hono";
import { StatusCode } from "hono/utils/http-status";

export const onError: ErrorHandler = (err, c) => {
  const currentStatus = "status" in err ? err.status : c.newResponse(null).status;

  const statusCode = currentStatus !== 200 ? (currentStatus as StatusCode) : 500;

  if (err instanceof OidcError) {
    return c.json(
      {
        name: err.name,
        error: err.errorType,
        message: err.message,
        status: err.status,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
      },
      err.status,
    );
  }

  return c.json(
    {
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    },
    statusCode,
  );
};
