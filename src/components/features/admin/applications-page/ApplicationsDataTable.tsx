"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@trustify/components/ui/data-table/DataTable";
import { rpcClient } from "@trustify/utils/rpc-client";
import { type FunctionComponent } from "react";
import { clientsDataTableColumns } from "./ApplicationsDataTableColumns";

export const ApplicationsDataTable: FunctionComponent = () => {
  const $clients = rpcClient.api.v1.clients.$get;

  const { data, isPending } = useQuery({
    queryKey: ["get_all_users"],
    queryFn: async () => {
      const result = await $clients();

      if (!result.ok) throw await result.json();

      const data = await result.json();

      return data;
    },
  });

  if (isPending) {
    return <DataTable data={[]} columns={[]} loading />;
  }

  if (data) {
    console.log(data);
    return <DataTable data={data} columns={clientsDataTableColumns} />;
  }
};
