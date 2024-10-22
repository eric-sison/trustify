import { LoginFormSchema, LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { AuthorizationService } from "@trustify/core/services/authorization-service";
import { OidcError } from "@trustify/core/types/oidc-error";
import { lucia } from "@trustify/config/lucia";
import { userAgent } from "next/server";
import { z } from "zod";
import { UserService } from "./user-service";

export class AuthenticationService {
  private readonly userService = new UserService();

  constructor(private readonly loginRequest: z.infer<typeof LoginRequestSchema>) {}

  public async authenticateUser(userId: string, headers: Headers) {
    // Create a session object
    const session = await lucia.createSession(userId, {
      clientId: this.loginRequest.client_id,
      userAgent: userAgent({ headers }),
      signedInAt: new Date(),
      consentGrant: false,
    });

    // Create session cookie and assign its ID from the session object
    const sessionCookie = lucia.createSessionCookie(session.id);

    // Set the sessionCookie in the browser, passing in values from sessionCookie
    //setCookie(this.context, sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return sessionCookie;
  }

  public async verifyUserEmail(email: string) {
    const user = await this.userService.verifyUserEmail(email);

    this.checkIfEmailIsVerified(user.emailVerified);

    this.checkIfUserIsSuspended(user.suspended);

    return user;
  }

  public async verifyUserPassword(hashedPw: string, plainPw: string) {
    await this.userService.verifyUserPassword(hashedPw, plainPw);
  }

  public async verifyUser(credentials: z.infer<typeof LoginFormSchema>) {
    // Get the user by email address
    const user = await this.userService.verifyUserEmail(credentials.email);

    // check if password is valid
    await this.userService.verifyUserPassword(user.password, credentials.password);

    // Check if user email is verified
    this.checkIfEmailIsVerified(user.emailVerified);

    // Check if user account is suspended
    this.checkIfUserIsSuspended(user.suspended);

    // If all checks passed, return the user
    return user;
  }

  public async redirectToCallback(userId: string) {
    const authorizationService = new AuthorizationService(this.loginRequest);

    if (this.loginRequest.response_type === "code") {
      return await authorizationService.authorizationCodeFlow(userId);
    }

    if (this.loginRequest.response_type === "code token") {
      // TODO: Implement flow
      return await authorizationService.hybridFlowCodeToken();
    }

    if (this.loginRequest.response_type === "code id_token") {
      // TODO: Implement flow
      return await authorizationService.hybridFlowCodeIdToken();
    }

    if (this.loginRequest.response_type === "code id_token token") {
      // TODO: Implement flow
      return await authorizationService.hybridFlowCodeIdTokenToken();
    }

    throw new OidcError({
      error: "unsupported_response_type",
      message: "The response type is not supported.",
      status: 400,
    });
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
