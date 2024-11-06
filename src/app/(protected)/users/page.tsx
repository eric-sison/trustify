import { UsersDataTable } from "@trustify/components/features/admin/users-page/UsersDataTable";
import { CreateUserDialog } from "@trustify/components/features/admin/users-page/CreateUserDialog";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
};

export default async function UsersPage() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <header>
          <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">Users</h2>
          <p>List of all registered users.</p>
        </header>
        <CreateUserDialog />
      </div>
      <UsersDataTable />
    </div>
  );
}
