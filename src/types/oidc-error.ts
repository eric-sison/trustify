import { StatusCode } from "hono/utils/http-status";

type ErrorDetails = {
  error: string;
  message: string;
  status: StatusCode;
};

export class OidcError extends Error {
  public status: StatusCode;
  public errorType: string;

  constructor({ error, message, status }: ErrorDetails) {
    super(message); // Calls the built-in Error constructor and sets the message
    this.name = "OidcError"; // Sets the error name
    this.status = status; // Adds a custom status code
    this.errorType = error; // Custom error type
    Object.setPrototypeOf(this, new.target.prototype); // Fixes instanceof checks
  }
}
