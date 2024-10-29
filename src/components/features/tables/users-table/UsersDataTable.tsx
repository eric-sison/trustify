"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@trustify/components/ui/data-table/DataTable";
import { rpcClient } from "@trustify/utils/rpc-client";
import { FunctionComponent } from "react";
import { usersColumns } from "./UsersDataTableColumns";
import { Skeleton } from "@trustify/components/ui/Skeleton";

export const UsersDataTable: FunctionComponent = () => {
  const $users = rpcClient.api.v1.users.$get;

  const { data } = useQuery({
    queryKey: ["get_all_users"],
    queryFn: async () => {
      const result = await $users();

      if (!result.ok) {
        throw await result.json();
      }

      return await result.json();
    },
  });

  if (data) {
    return <DataTable data={data} columns={usersColumns} />;
  }

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-4 gap-7">
        <Skeleton className="h-8 w-full" />
      </div>

      <section className="space-y-3">
        <div className="grid grid-cols-5 gap-12">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>

        <div className="grid grid-cols-5 gap-12">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-32" />
        </div>
      </section>

      <div className="flex justify-end pt-5">
        <Skeleton className="h-7 w-96" />
      </div>
    </div>
  );
};
