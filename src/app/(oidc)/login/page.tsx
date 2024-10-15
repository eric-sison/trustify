import { AuthenticationService } from "@trustify/core/services/authentication-service";
import { OidcLoginForm } from "@trustify/components/features/oidc/OidcLoginForm";
import { validateSession } from "@trustify/core/libs/validate-session";
import { LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { PageProps } from "@trustify/types/page-props";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";

export const metadata: Metadata = {
  title: "Login",
};

export default async function OidcLogin(props: PageProps<string, z.infer<typeof LoginRequestSchema>>) {
  // Check if params are valid
  const parsedParams = LoginRequestSchema.safeParse(props.searchParams);

  // If not, redirect to fallback url
  if (!parsedParams.success) {
    // console.log(parsedParams.error.issues);
    redirect("/");
  }

  // Validate session to check if there is an active session
  const session = await validateSession();

  // If there is an active session and the client did not supply a prompt,
  // redirect the user agent back to the repecified redirect_uri
  if (session && !parsedParams.data.prompt) {
    // Initialize authentication service
    const authenticationService = new AuthenticationService(parsedParams.data);

    // Process the URL to return values requested from response_type
    const url = await authenticationService.redirectToCallback(session.user.id);

    // Redirect the user agent back to its callback url
    redirect(url);
  }

  // If there is a session, check for prompt parameter
  // If there is a prompt parameter, handle each case where prompt contains "login"
  // If prompt = login or login consent, render login form to force the user to reauthenticate
  // Or if there is no session, authenticate the user
  if ((session && parsedParams.data.prompt?.includes("login")) || session === null) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-96">
          <OidcLoginForm {...parsedParams.data} />
        </div>
      </div>
    );
  }
}
