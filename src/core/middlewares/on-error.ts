import { OidcError } from "@trustify/core/types/oidc-error";
import { ErrorHandler } from "hono";
import { StatusCode } from "hono/utils/http-status";
import {
  JOSEAlgNotAllowed,
  JWKInvalid,
  JWKSInvalid,
  JWSSignatureVerificationFailed,
  JWTExpired,
} from "jose/errors";

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

  if (err instanceof JWSSignatureVerificationFailed) {
    return c.json(
      {
        name: err.name,
        error: err.code,
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
      },
      401,
    );
  }

  if (err instanceof JWTExpired) {
    return c.json(
      {
        name: err.name,
        error: err.code,
        reason: err.reason,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
      },
      401,
    );
  }

  if (err instanceof JWKInvalid || err instanceof JWKSInvalid) {
    return c.json(
      {
        name: err.name,
        error: err.code,
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
      },
      401,
    );
  }

  if (err instanceof JOSEAlgNotAllowed) {
    return c.json(
      {
        name: err.name,
        error: err.code,
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
      },
      401,
    );
  }

  return c.json(
    {
      name: err.name,
      message: err,
      error: err.cause,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    },
    statusCode,
  );
};
