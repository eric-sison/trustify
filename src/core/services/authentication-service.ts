import { z } from "zod";
import { LoginFormSchema } from "../schemas/auth-schema";
import { UserRepository } from "../repositories/user-repository";
import { OidcError } from "@trustify/types/oidc-error";
import { verifyHash } from "@trustify/utils/hash-fns";
import { UserClientRepository } from "../repositories/user-client-repository";
import { lucia } from "@trustify/config/lucia";
import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { HonoAppBindings } from "@trustify/app/api/[[...route]]/route";
import { users } from "@trustify/db/schema/users";

export class AuthenticationService {
  constructor(
    private readonly credentials: z.infer<typeof LoginFormSchema>,
    private readonly context: Context<HonoAppBindings>,
  ) {}

  public async authenticateUser(user: typeof users.$inferSelect, clientId: string) {
    // Check if the user belongs to a client
    const tenant = await this.belongsToClient(user.id, clientId);

    // Perform additional checks (i.e. is_email_verified, is_suspended)
    await this.verifyUser(tenant);

    // Get the current timestamp as the signin date
    const signInDate = new Date();

    const session = await lucia.createSession(user.id, {});

    const sessionCookie = lucia.createSessionCookie(session.id);

    setCookie(this.context, sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    await tenant.userClientRepository.updateSignInDetails(
      session.id,
      tenant.userClient.userId,
      tenant.userClient.clientId,
      signInDate,
      this.context.req.header("User-Agent"),
    );

    return tenant.userClient;
  }

  public async getUserFromCredentials() {
    // Initialize userRepository to interact with the database
    const userRepository = new UserRepository();

    // Get the user by email address
    const user = await userRepository.getUserByEmail(this.credentials.email);

    // check if password is valid
    const isPasswordValid = await verifyHash(user.password, this.credentials.password);

    // Throw an error if user was not found
    if (!user || !isPasswordValid) {
      throw new OidcError({
        error: "invalid_credentials",
        message: "Incorrect email or password. Try again.",
        status: 401,
      });
    }

    // If all checks passed, return the user
    return user;
  }

  private async belongsToClient(userId: string, clientId: string) {
    // Initialize userClientRepository to interact with the database
    const userClientRepository = new UserClientRepository();

    // Get the userClient to check if userId is registered under a clientId
    const userClient = await userClientRepository.getUserClientByIds(userId, clientId);

    // Throw an error if userClient is undefined
    if (!userClient) {
      throw new OidcError({
        error: "unregistered_user",
        message: "User is not registered under this client",
        status: 403,
      });
    }

    // Otherwise, return the userClient
    return { userClient, userClientRepository };
  }

  private async verifyUser(user: Awaited<ReturnType<typeof this.belongsToClient>>) {
    // check if registered user's email is verified
    this.checkIfEmailIsVerified(user.userClient.emailVerified);

    // check if registered user's account is suspended
    this.checkIfUserIsSuspended(user.userClient.suspended);
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
