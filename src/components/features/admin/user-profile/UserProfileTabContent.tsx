import { type FunctionComponent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@trustify/components/ui/Tabs";
import { PageContent } from "../../layouts/PageContent";
import { UserProfileAuthDetailsForm } from "./UserProfileAuthDetailsForm";
import { UserProfileUserDataForm } from "./UserProfileUserDataForm";
import { UserData } from "@trustify/core/types/user";
import { UserProfileAddressForm } from "./UserProfileAddressForm";

export const UserProfileTabContent: FunctionComponent<UserData> = (user) => {
  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList className="full">
        <TabsTrigger value="details">User Details</TabsTrigger>
        <TabsTrigger value="roles">Roles & Permission</TabsTrigger>
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="logs">Audit Logs</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-7 pb-10">
        <PageContent
          title="Authentication"
          subtitle="This section provides the authentication details of the user."
          content={<UserProfileAuthDetailsForm {...user} />}
        />

        <PageContent
          title="User Data"
          subtitle="Each user has a profile containing all user information. It consists of basic data, social identities, and custom data."
          content={<UserProfileUserDataForm {...user} />}
        />

        <PageContent
          title="Address"
          subtitle="This section provides the End-User's preferred postal address."
          content={<UserProfileAddressForm {...user.address} />}
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
