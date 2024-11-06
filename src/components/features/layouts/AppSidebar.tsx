"use client";

import { useState, type FunctionComponent, type PropsWithChildren } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@trustify/components/ui/Avatar";
import {
  AudioWaveform,
  Bell,
  BookOpen,
  ChevronsUpDown,
  CircleUserRound,
  Command,
  Cookie,
  FileKey2,
  FilePen,
  GalleryVerticalEnd,
  Link2,
  Lock,
  LogOut,
  MailCheck,
  PieChart,
  Plus,
  ScreenShare,
  ShieldCheck,
  SquareMousePointer,
  Users,
  Webhook,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@trustify/components/ui/Sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@trustify/components/ui/DropdownMenu";
import { usePathname, useRouter } from "next/navigation";
import { Separator } from "@trustify/components/ui/Separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@trustify/components/ui/Tooltip";
import { AppTopbar } from "./AppTopbar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "",
  },

  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],

  main: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: PieChart,
    },
    {
      title: "Audit Logs",
      url: "/logs",
      icon: FilePen,
    },
    {
      title: "Applications",
      url: "/applications",
      icon: ScreenShare,
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
    },
    {
      title: "Sessions",
      url: "/sessions",
      icon: Cookie,
    },
    {
      title: "Authentication",
      url: "/authentication",
      icon: Lock,
    },
    {
      title: "Permissions",
      url: "/permissions",
      icon: ShieldCheck,
    },
  ],

  config: [
    {
      title: "Email",
      url: "/email",
      icon: MailCheck,
    },
    {
      title: "SMS",
      url: "/sms",
      icon: SquareMousePointer,
    },
    {
      title: "Webhooks",
      url: "/webhooks",
      icon: Webhook,
    },
    {
      title: "Domains",
      url: "/domains",
      icon: Link2,
    },
    {
      title: "Key Management",
      url: "/keys",
      icon: FileKey2,
    },
  ],
};

export const AppSidebar: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [activeApp, setActiveApp] = useState(data.teams[0]);

  const pathName = usePathname();

  const router = useRouter();

  const { state } = useSidebar();

  return (
    <>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="space-x-1 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 flex-shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <activeApp.logo className="size-4 flex-shrink-0" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{activeApp.name}</span>
                      <span className="truncate text-xs">{activeApp.plan}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                    Applications
                  </DropdownMenuLabel>
                  {data.teams.map((app, index) => (
                    <DropdownMenuItem key={app.name} onClick={() => setActiveApp(app)} className="gap-2 p-2">
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        <app.logo className="size-4 shrink-0" />
                      </div>
                      {app.name}
                      <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 p-2">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <Plus className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">Add Application</div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <Separator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-widest">General</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.main.map((item) => {
                  return (
                    <SidebarMenuItem key={item.title}>
                      {state === "collapsed" ? (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SidebarMenuButton
                                isActive={pathName.startsWith(item.url)}
                                onClick={() => router.push(item.url)}
                              >
                                <item.icon />
                                <span>{item.title}</span>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                            <TooltipContent side="right">{item.title}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <SidebarMenuButton
                          isActive={pathName.startsWith(item.url)}
                          onClick={() => router.push(item.url)}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-widest">Configuration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.config.map((item) => {
                  return (
                    <SidebarMenuItem key={item.title}>
                      {state === "collapsed" ? (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SidebarMenuButton
                                isActive={pathName.startsWith(item.url)}
                                onClick={() => router.push(item.url)}
                              >
                                <item.icon />
                                <span>{item.title}</span>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                            <TooltipContent side="right">{item.title}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <SidebarMenuButton
                          isActive={pathName.startsWith(item.url)}
                          onClick={() => router.push(item.url)}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={data.user.avatar} alt={data.user.name} />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{data.user.name}</span>
                      <span className="truncate text-xs">{data.user.email}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={data.user.avatar} alt={data.user.name} />
                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{data.user.name}</span>
                        <span className="truncate text-xs">{data.user.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Documentation
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <CircleUserRound className="h-4 w-4" />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="overflow-y-auto">
        <AppTopbar />
        <Separator />
        <div className="h-full px-20 py-10 sm:px-7 md:px-10 xl:px-20">{children}</div>
      </SidebarInset>
    </>
  );
};
