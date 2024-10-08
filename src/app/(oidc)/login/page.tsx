import { OidcLoginForm } from "@trustify/components/features/OidcLoginForm";
import { appConfig } from "@trustify/config/environment";
import { validateSession } from "@trustify/core/libs/validate-session";
import { LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { PageProps } from "@trustify/types/page-props";
import { encodeUrl } from "@trustify/utils/encode-url";
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
    redirect("/");
  }

  // Validate session info to check if there is an active session
  const session = await validateSession();

  // If so, redirect the user to the consent page
  if (session !== null) {
    const consentUrl = encodeUrl({
      base: appConfig.adminHost,
      path: "/consent",
      params: {
        ...parsedParams.data,
      },
    });

    redirect(consentUrl);
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-96">
        <OidcLoginForm {...parsedParams.data} />
      </div>
    </div>
  );
}
