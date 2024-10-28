import { AppSidebar } from "@trustify/components/features/layouts/AppSidebar";
import { SidebarProvider } from "@trustify/components/ui/Sidebar";
import { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider className="h-full w-full">
      <AppSidebar>{children}</AppSidebar>
    </SidebarProvider>
  );
}
