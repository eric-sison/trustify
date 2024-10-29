"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@trustify/components/ui/Breadcrumb";
import { Separator } from "@trustify/components/ui/Separator";
import { SidebarTrigger } from "@trustify/components/ui/Sidebar";
import { usePathname } from "next/navigation";
import { Fragment, FunctionComponent } from "react";
import { ThemePickerDropdown } from "../utils/ThemePickerDropdown";

export const AppTopbar: FunctionComponent = () => {
  const pathName = usePathname();

  const pathSegments = pathName.replace(/^\/|\/$/g, "").split("/");

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="h-5 w-5" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {pathSegments.map((segment, index) => {
              const linkPath = `/${pathSegments.slice(0, index + 1).join("/")}`;

              return (
                <Fragment key={index}>
                  <BreadcrumbItem className="hidden capitalize md:block">
                    {index === pathSegments.length - 1 ? (
                      segment // If it's the last item, don't make it a link
                    ) : (
                      <BreadcrumbLink href={linkPath}>{segment}</BreadcrumbLink> // Otherwise, wrap it in a link
                    )}
                  </BreadcrumbItem>
                  {index < pathSegments.length - 1 && (
                    <BreadcrumbSeparator className="hidden md:block" /> // Separator except after last item
                  )}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="px-7">
        <ThemePickerDropdown />
      </div>
    </header>
  );
};
