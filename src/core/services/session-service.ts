import { SessionRepository } from "../repositories/session-repository";
import { OidcError } from "../types/oidc-error";

export class SessionService {
  private readonly sessionRepository = new SessionRepository();

  public async getSessionDetails(sessionId: string) {
    // Get the sessionDetails from session object
    const sessionDetails = await this.sessionRepository.getSessionDetails(sessionId);

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
}
