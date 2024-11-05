"use client";

import { type FunctionComponent } from "react";
import { useQuery } from "@tanstack/react-query";
import { rpcClient } from "@trustify/utils/rpc-client";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileContent } from "./ProfileContent";
import { Button } from "@trustify/components/ui/Button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export const UserProfile: FunctionComponent<{ userid: string }> = ({ userid }) => {
  const $user = rpcClient.api.v1.users[":userid"].$get;

  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["user_profile"],
    queryFn: async () => {
      const res = await $user({
        param: {
          userid,
        },
      });

      if (!res.ok) throw await res.json();

      const data = await res.json();

      const birthdate = data.birthdate ? new Date(data.birthdate) : new Date();

      return { ...data, birthdate };
    },
  });

  if (data) {
    return (
      <div className="h-full space-y-7 sm:px-0 md:px-0 xl:px-20">
        <Button
          variant="link"
          onClick={() => router.push("/users")}
          className="space-x-2 p-0 text-base text-muted-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Go back to users</span>
        </Button>

        <ProfileHeader
          defaultColor={data.metadata.defaultColor}
          avatarUrl={data?.picture}
          email={data?.email}
          username={data?.preferredUsername}
        />

        <ProfileContent {...data} />
      </div>
    );
  }
};
