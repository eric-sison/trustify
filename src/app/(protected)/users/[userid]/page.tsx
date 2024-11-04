import { UserProfile } from "@trustify/components/features/users/user-profile/UserProfile";
import { PageProps } from "@trustify/types/page-props";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
};

export default async function UserProfilePage(props: PageProps<{ userid: string }>) {
  const params = await props.params;

  if (params?.userid) {
    return <UserProfile userid={params.userid} />;
  }
}
