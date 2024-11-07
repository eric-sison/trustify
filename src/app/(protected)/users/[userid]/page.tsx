import { UserProfileHeader } from "@trustify/components/features/admin/user-profile/UserProfileHeader";
import { UserProfileTabContent } from "@trustify/components/features/admin/user-profile/UserProfileTabContent";
import { PageProps } from "@trustify/types/page-props";
import { Environment } from "@trustify/config/environment";
import { UserData, UserIdentity } from "@trustify/core/types/user";
import { notFound } from "next/navigation";
import { UserIdParamSchema } from "@trustify/core/schemas/user-schema";
import { ArrowLeft } from "lucide-react";
import { lucia } from "@trustify/config/lucia";
import { Metadata } from "next";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { validateSession } from "@trustify/utils/validate-session";

export async function generateMetadata(props: PageProps<{ userid: string }>): Promise<Metadata> {
  const sid = await validateSession();

  const host = Environment.getPublicConfig().adminHost;

  const identifier = await props.params;

  if (sid && identifier) {
    try {
      const result = await axios.get<UserIdentity>(`${host}/api/v1/users/identity/${identifier?.userid}`, {
        headers: {
          Cookie: sid.session.id ? `${lucia.sessionCookieName}=${sid.session.id}` : undefined,
        },
      });

      return {
        title: result.data.name ? result.data.name : result.data.prefferedUsername,
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      notFound();
    }
  }

  notFound();
}

const getUserData = async (userId: string) => {
  const sid = await validateSession();

  const host = Environment.getPublicConfig().adminHost;

  if (sid) {
    try {
      const result = await axios.get(`${host}/api/v1/users/${userId}`, {
        headers: {
          Cookie: sid.session.id ? `${lucia.sessionCookieName}=${sid.session.id}` : undefined,
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
