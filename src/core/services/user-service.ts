import { UserRepository } from "@trustify/core/repositories/user-repository";
import { OidcError } from "@trustify/core/types/oidc-error";

export class UserService {
  private readonly userRepository = new UserRepository();

  public async getUserById(userId: string) {
    // Get the user by ID
    const user = await this.userRepository.getUserById(userId);

    // Throw an error if the user is not found
    if (!user) {
      throw new OidcError({
        error: "invalid_user",
        message: "User not found!",
        status: 404,
      });
    }

    // Return user
    return user;
  }
}
