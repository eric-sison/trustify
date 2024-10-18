import { OidcConsentForm } from "@trustify/components/features/oidc/OidcConsentForm";
import { Environment } from "@trustify/config/environment";
import { validateSession } from "@trustify/utils/validate-session";
import { LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { PageProps } from "@trustify/types/page-props";
import { encodeUrl } from "@trustify/utils/encode-url";
import { redirect } from "next/navigation";
import { z } from "zod";

export default async function OidcConsent(props: PageProps<string, z.infer<typeof LoginRequestSchema>>) {
  // Parse params to validate its shape
  const parsedParams = LoginRequestSchema.safeParse(props.searchParams);

  // If any of the params are of invalid type or format, redirect to fallback url
  if (!parsedParams.data) {
    // console.log("parsedData");
    // return null;
    redirect("/");
  }

  // Get user details from session
  const session = await validateSession();

  // If session is not valid, redirect user to login page
  if (!session) {
    const loginUrl = encodeUrl({
      base: Environment.getPublicConfig().adminHost,
      path: "/login",
      params: parsedParams.data,
    });

    redirect(loginUrl);
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <OidcConsentForm loginRequest={{ ...parsedParams.data }} />
    </div>
  );
}
