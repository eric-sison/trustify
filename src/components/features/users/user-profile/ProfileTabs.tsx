import { type FunctionComponent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@trustify/components/ui/Tabs";
import { PageContent } from "../../layouts/PageContent";
import { ProfileAuthenticationForm } from "./ProfileAuthenticationForm";
import { UserData } from "@trustify/core/types/user";

export const ProfileTabs: FunctionComponent<UserData> = (user) => {
  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="logs">User Logs</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-7 pb-10">
        <PageContent
          title="Authentication"
          subtitle="This section provides the authentication details of the user."
          content={<ProfileAuthenticationForm {...user} />}
        />

        <PageContent
          title="User Data"
          subtitle="Each user has a profile containing all user information. It consists of basic data, social identities, and custom data."
          content={<></>}
        />
      </TabsContent>

      <TabsContent value="roles">
        <PageContent
          title="User Roles"
          subtitle="Each user has a profile containing all user information. It consists of basic data, social identities, and custom data."
          content={<></>}
        />
      </TabsContent>

      <TabsContent value="organization">
        <PageContent
          title="Organization"
          subtitle="Each user has a profile containing all user information. It consists of basic data, social identities, and custom data."
          content={<></>}
        />
      </TabsContent>

      <TabsContent value="logs">
        <PageContent
          title="User Logs"
          subtitle="Each user has a profile containing all user information. It consists of basic data, social identities, and custom data."
          content={<></>}
        />
      </TabsContent>
    </Tabs>
  );
};
