"use client";

import { type FunctionComponent } from "react";
import { useQuery } from "@tanstack/react-query";
import { rpcClient } from "@trustify/utils/rpc-client";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";
import { Button } from "@trustify/components/ui/Button";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft } from "lucide-react";

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

      if (!res.ok) {
        throw await res.json();
      }

      return await res.json();
    },
  });

  if (data) {
    return (
      <div className="h-full space-y-7 px-20">
        <Button
          variant="link"
          onClick={() => router.back()}
          className="space-x-2 p-0 text-base text-muted-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Go Back</span>
        </Button>

        <ProfileHeader
          defaultColor={data.metadata.defaultColor}
          avatarUrl={data?.picture}
          email={data?.email}
          username={data?.preferredUsername}
        />
        <ProfileTabs {...data} />
      </div>
    );
  }
};
