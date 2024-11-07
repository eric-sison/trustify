import { PageProps } from "@trustify/types/page-props";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { Environment } from "@trustify/config/environment";
import { validateSession } from "@trustify/utils/validate-session";
import { lucia } from "@trustify/config/lucia";
import { clients } from "@trustify/db/schema/clients";
import { ClientIdParamSchema } from "@trustify/core/schemas/client-schema";
import { notFound } from "next/navigation";
import { ApplicationDetailsHeader } from "@trustify/components/features/admin/application-details/ApplicationDetailsHeader";
import { ApplicationDetailsContent } from "@trustify/components/features/admin/application-details/ApplicationDetailsContent";

const getClientData = async (clientId: string) => {
  const sid = await validateSession();

  const host = Environment.getPublicConfig().adminHost;

  if (sid) {
    try {
      const result = await axios.get(`${host}/api/v1/clients/${clientId}`, {
        headers: {
          Cookie: sid.session.id ? `${lucia.sessionCookieName}=${sid.session.id}` : undefined,
        },
      });

      return {
        data: result.data as typeof clients.$inferSelect,
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

export default async function ClientAppDetailsPage(props: PageProps<{ clientid: string }>) {
  const parsedParams = ClientIdParamSchema.safeParse(await props.params);

  if (!parsedParams.success) {
    notFound();
  }

  const app = await getClientData(parsedParams.data.clientid);

  if (!app?.data) {
    notFound();
  }

  return (
    <div className="h-full space-y-7 sm:px-0 md:px-0 xl:px-20">
      <Link
        href="/applications"
        className="flex items-center gap-1 text-base text-muted-foreground underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Go back to apps</span>
      </Link>

      <ApplicationDetailsHeader app={app.data} />

      <ApplicationDetailsContent />
    </div>
  );
}
