import { PageProps } from "@trustify/types/page-props";
import { Metadata } from "next";
import { Environment } from "@trustify/config/environment";
import { cookies } from "next/headers";
import { UserData, UserIdentity } from "@trustify/core/types/user";
import { notFound } from "next/navigation";
import { UserIdParamSchema } from "@trustify/core/schemas/user-schema";
import { ArrowLeft } from "lucide-react";
import { UserProfileHeader } from "@trustify/components/features/admin/user-profile/UserProfileHeader";
import { UserProfileTabContent } from "@trustify/components/features/admin/user-profile/UserProfileTabContent";
import { lucia } from "@trustify/config/lucia";
import axios, { AxiosError } from "axios";
import Link from "next/link";

export async function generateMetadata(props: PageProps<{ userid: string }>): Promise<Metadata> {
  const cookie = await cookies();

  const sid = cookie.get(lucia.sessionCookieName)?.value ?? null;

  const host = Environment.getPublicConfig().adminHost;

  const identifier = await props.params;

  if (identifier) {
    try {
      const result = await axios.get<UserIdentity>(`${host}/api/v1/users/identity/${identifier?.userid}`, {
        headers: {
          Cookie: cookie.get(lucia.sessionCookieName)?.value
            ? `${lucia.sessionCookieName}=${sid}`
            : undefined,
        },
      });

      return {
        title: result.data.name ?? result.data.prefferedUsername,
      };
    } catch (error) {
      notFound();
    }
  }

  notFound();
}

const getUserData = async (id: string) => {
  const cookie = await cookies();

  const sid = cookie.get(lucia.sessionCookieName)?.value ?? null;

  const host = Environment.getPublicConfig().adminHost;

  if (cookie) {
    try {
      const result = await axios.get(`${host}/api/v1/users/${id}`, {
        headers: {
          Cookie: cookie.get(lucia.sessionCookieName)?.value
            ? `${lucia.sessionCookieName}=${sid}`
            : undefined,
        },
      });

      return {
        data: result.data as UserData,
        status: result.status,
        error: null,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          data: null,
          error: error.response?.data,
          status: error.status,
        };
      }

      throw error;
    }
  }
};

export default async function UserProfilePage(props: PageProps<{ userid: string }>) {
  const parsedParams = UserIdParamSchema.safeParse(await props.params);

  if (!parsedParams.success) {
    notFound();
  }

  const user = await getUserData(parsedParams.data.userid);

  if (!user?.data) {
    notFound();
  }

  return (
    <div className="h-full space-y-7 sm:px-0 md:px-0 xl:px-20">
      <Link
        href="/users"
        className="flex items-center gap-1 text-base text-muted-foreground underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Go back to users</span>
      </Link>

      <UserProfileHeader user={user.data} />

      <UserProfileTabContent user={user.data} />
    </div>
  );
}
