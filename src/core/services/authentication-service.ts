import { z } from "zod";
import { LoginFormSchema } from "../schemas/auth-schema";
import { UserRepository } from "../repositories/user-repository";
import { OidcError } from "@trustify/core/types/oidc-error";
import { verifyHash } from "@trustify/utils/hash-fns";
import { lucia } from "@trustify/config/lucia";
import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { users } from "@trustify/db/schema/users";
import { generateIdFromEntropySize, Session } from "lucia";
import { SessionRepository } from "../repositories/session-repository";
import { AUTH_CODE_LENGTH } from "@trustify/utils/constants";
import { redisStore } from "@trustify/config/redis";
import { AuthCodePayload } from "../types/auth-code-payload";
import { userAgent } from "next/server";

export class AuthenticationService {
  constructor(private readonly context: Context<HonoAppBindings>) {}

  public async authenticateUser(user: typeof users.$inferSelect) {
    // Create a session object
    const session = await lucia.createSession(user.id, {
      clientId: this.context.req.query("client_id")!,
      userAgent: userAgent(this.context.req.raw),
      signedInAt: new Date(),
    });

    // Create session cookie and assign its ID from the session object
    const sessionCookie = lucia.createSessionCookie(session.id);

    // Set the sessionCookie in the browser, passing in values from sessionCookie
    setCookie(this.context, sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }

  public async getUser(credentials: z.infer<typeof LoginFormSchema>) {
    // Initialize userRepository to interact with the database
    const userRepository = new UserRepository();

    // Get the user by email address
    const user = await userRepository.getUserByEmail(credentials.email);

    // Throw an error if user was not found
    if (!user) {
      throw new OidcError({
        error: "invalid_credentials",
        message: "Incorrect email or password. Try again.",
        status: 401,
      });
    }

    // check if password is valid
    const isPasswordValid = await verifyHash(user.password, credentials.password);

    if (!isPasswordValid) {
      throw new OidcError({
        error: "invalid_credentials",
        message: "Incorrect email or password. Try again.",
        status: 401,
      });
    }

    // Check if user email is verified
    this.checkIfEmailIsVerified(user.emailVerified);

    // Check if user account is suspended
    this.checkIfUserIsSuspended(user.suspended);

    // If all checks passed, return the user
    return user;
  }

  public async getAuthenticationDetails(session: Session) {
    // Initialize sessionRepository to interact with the database
    const sessionRepository = new SessionRepository();

    // Get the sessionDetails from session object
    const sessionDetails = await sessionRepository.getSessionDetails(session);

    // Throw an error if session is not found in the database
    if (!sessionDetails) {
      throw new OidcError({
        error: "invalid_session",
        message: "Your session is invalid.",
        status: 401,
      });
    }

    // Return the sesion details
    return sessionDetails;
  }

  public async getStateFromStore(key: string | undefined) {
    if (key) {
      try {
        // Get the state from the store using the opaqueState as key
        const state = await redisStore.get(key);

        // After acquiring the state from store, delete it
        await redisStore.del(key);

        // Return state - if undefined, return a pre-defined string
        return state ?? "invalid-or-expired";

        // Handle redis erro
      } catch (error) {
        // log the error
        this.context.var.logger.error(error);

        // Throw error if storing state to redis has failed
        throw new OidcError({
          error: "redis_get_failed",
          message: "Failed to get value to redis store.",
          status: 500,
        });
      }
    }
  }

  public async generateAuthorizationCode(payload: AuthCodePayload) {
    try {
      // Generate authorization code
      const authorizationCode = `auc_${generateIdFromEntropySize(AUTH_CODE_LENGTH)}`;

      // Attempt to store it in redis
      await redisStore.set(authorizationCode, JSON.stringify(payload), "EX", 60 * 5);

      // Return the generated authorization code
      return authorizationCode;

      // Handle redis error
    } catch (error) {
      // log the error
      this.context.var.logger.error(error);

      // Throw error if storing state to redis has failed
      throw new OidcError({
        error: "redis_set_failed",
        message: "Failed to set value to redis store.",
        status: 500,
      });
    }
  }

  private checkIfEmailIsVerified(isEmailVerified: boolean) {
    // Throw an error if the user's email is not verified
    if (!isEmailVerified) {
      throw new OidcError({
        error: "unverified_email",
        message: "User email is not yet verified.",
        status: 400,
      });
    }
  }

  private checkIfUserIsSuspended(isSuspended: boolean) {
    // Throw an error if the user's account is suspended
    if (isSuspended) {
      throw new OidcError({
        error: "suspended_user",
        message: "User account is suspended.",
        status: 400,
      });
    }
  }
}
