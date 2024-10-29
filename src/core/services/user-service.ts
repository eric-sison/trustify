import { UserRepository } from "@trustify/core/repositories/user-repository";
import { OidcError } from "@trustify/core/types/oidc-error";
import { verifyHash } from "@trustify/utils/hash-fns";

export class UserService {
  private readonly userRepository = new UserRepository();

  public async getAllUsers() {
    return await this.userRepository.getAllUsers();
  }

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

  public async verifyUserEmail(email: string) {
    // Get the user by email address
    const user = await this.userRepository.getUserByEmail(email);

    // Throw an error if user was not found
    if (!user) {
      throw new OidcError({
        error: "invalid_credentials",
        message: "Incorrect email or password. Try again.",
        status: 401,
      });
    }

    return user;
  }

  public async verifyUserPassword(hashedPw: string, plainPw: string) {
    // check if password is valid
    const isPasswordValid = await verifyHash(hashedPw, plainPw);

    if (!isPasswordValid) {
      throw new OidcError({
        error: "invalid_credentials",
        message: "Incorrect email or password. Try again.",
        status: 401,
      });
    }
  }
}
