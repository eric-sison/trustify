"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@trustify/components/ui/data-table/DataTable";
import { rpcClient } from "@trustify/utils/rpc-client";
import { FunctionComponent } from "react";
import { columns } from "./UsersDataTableColumns";

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
     return <DataTable data={data} columns={columns} />;
    // return <div>Users Table</div>
  }
};