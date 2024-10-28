"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@trustify/components/ui/Breadcrumb";
import { Separator } from "@trustify/components/ui/Separator";
import { usePathname } from "next/navigation";
import { Fragment, FunctionComponent } from "react";

export const AppTopbar: FunctionComponent = () => {
  const pathName = usePathname();

  const pathSegments = pathName.replace(/^\/|\/$/g, "").split("/");

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
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
            {/* <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem> */}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
};
