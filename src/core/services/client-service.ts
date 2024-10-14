import { ClientRepository } from "@trustify/core/repositories/client-repository";
import { OidcError } from "@trustify/core/types/oidc-error";
import { verifyHash } from "@trustify/utils/hash-fns";

export class ClientService {
  private readonly clientRepository = new ClientRepository();

  public async getClientAuthMethod(clientId: string | undefined) {
    if (!clientId) {
      throw new OidcError({
        error: "invalid_client_id",
        message: "No client_id supplied!",
        status: 400,
      });
    }

    const clientAuthMethod = await this.clientRepository.getClientAuthMethod(clientId);

    if (!clientAuthMethod) {
      throw new OidcError({
        error: "invalid_client_method",
        message: `Client auth method for client ${clientId} is not valid`,
        status: 400,
      });
    }

    return clientAuthMethod.method;
  }

  public async verifyClientCredentials(clientId: string, secret: string) {
    // Initialize clientRepository to interact with the database
    // const clientRepository = new ClientRepository();

    // Get the client by ID
    const client = await this.clientRepository.getClientById(clientId);

    // If there is no client matching the ID, throw an error
    if (!client) {
      throw new OidcError({
        error: "invalid_client",
        message: "Invalid client credentials!",
        status: 401,
      });
    }

    // Otherwise, check if client secret matches with the hashed secret stored in the database
    const isSecretValid = await verifyHash(client.secret, secret);

    // If not, throw an error
    if (!isSecretValid) {
      throw new OidcError({
        error: "invalid_client",
        message: "Invalid client credentials!",
        status: 401,
      });
    }

    // Otherwise, return the client
    return client;
  }
}
