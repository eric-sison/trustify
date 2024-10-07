import { OidcLoginForm } from "@trustify/components/features/OidcLoginForm";
import { LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { PageProps } from "@trustify/types/page-props";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";

export const metadata: Metadata = {
  title: "Login",
};

export default function OidcLogin(props: PageProps<string, z.infer<typeof LoginRequestSchema>>) {
  const parsedParams = LoginRequestSchema.safeParse(props.searchParams);

  if (!parsedParams.success) {
    redirect("/");
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-96">
        <OidcLoginForm {...parsedParams.data} />
      </div>
    </div>
  );
}
