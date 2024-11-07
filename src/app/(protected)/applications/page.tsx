import { ApplicationsDataTable } from "@trustify/components/features/admin/applications-page/ApplicationsDataTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applications",
};

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <header>
          <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">Applications</h2>
          <p>List of all applications.</p>
        </header>
        Add Application
      </div>

      <ApplicationsDataTable />
    </div>
  );
}
