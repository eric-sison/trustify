import { Metadata } from "next";
import { Button } from "@trustify/components/ui/Button";
import { UsersDataTable } from "@trustify/components/features/tables/users-table/UsersDataTable";

export const metadata: Metadata = {
  title: "Users",
};

export default async function UsersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">Users</h2>
        <Button>Create User</Button>
      </div>
      <UsersDataTable />
    </div>
  );
}
