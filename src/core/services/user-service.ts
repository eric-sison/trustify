import { UserRepository } from "@trustify/core/repositories/user-repository";
import { OidcError } from "@trustify/core/types/oidc-error";
import { createHash, verifyHash } from "@trustify/utils/hash-fns";
import { z } from "zod";
import { UserRegistrationFormSchema } from "../schemas/auth-schema";
import { users } from "@trustify/db/schema/users";

export class UserService {
  private readonly userRepository = new UserRepository();

  public async insertUser(userInfo: z.infer<typeof UserRegistrationFormSchema>) {
    const hashedPw = await createHash(userInfo.password);

    const newUser = await this.userRepository.createUser({ ...userInfo, password: hashedPw });

    return newUser;
  }

  public async verifyIfEmailOrUsernameExists(email: string, username: string) {
    const userWithEmail = await this.getUserByEmail(email);

    if (userWithEmail) {
      throw new OidcError({
        error: "email_already_exists",
        message: "A user with the same email already exists.",
        status: 400,
      });
    }

    const userWithUsername = await this.getUserByUsername(username);

    if (userWithUsername) {
      throw new OidcError({
        error: "username_already_exists",
        message: "A user with the same username already exists.",
        status: 400,
      });
    }
  }

  public async getAllUsers() {
    return await this.userRepository.getAllUsers();
  }

  public async getUserById(id: string) {
    return await this.userRepository.getUserById(id);
  }

  public async getUserByEmail(email: string) {
    return await this.userRepository.getUserByEmail(email);
  }

  public async getUserByUsername(username: string) {
    return await this.userRepository.getUserByPreferredUsername(username);
  }

  public async getUserIdentity(userId: string) {
    return await this.userRepository.getUserIdentity(userId);
  }

  public async verifyUserId(userId: string) {
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

  public async updateUser(userId: string, data: Partial<typeof users.$inferInsert>) {
    return await this.userRepository.updateUser(userId, data);
  }
}
