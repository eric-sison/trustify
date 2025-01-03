import { AppSidebar } from "@trustify/components/features/layouts/AppSidebar";
import { SidebarProvider } from "@trustify/components/ui/Sidebar";
import { PropsWithChildren } from "react";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider className="h-full w-full overflow-y-hidden">
      <AppSidebar>{children}</AppSidebar>
    </SidebarProvider>
  );
}
