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
  FilePen,
  GalleryVerticalEnd,
  KeyRound,
  Link2,
  Lock,
  LogOut,
  MailCheck,
  PieChart,
  Plus,
  Settings2,
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
import { usePathname } from "next/navigation";

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
      url: "/admin",
      icon: PieChart,
    },
    {
      title: "Audit Logs",
      url: "/admin/logs",
      icon: FilePen,
    },
    {
      title: "App Settings",
      url: "/admin/settings",
      icon: Settings2,
    },
  ],

  users: [
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Sessions",
      url: "/admin/sessions",
      icon: Cookie,
    },
    {
      title: "Authentication",
      url: "/admin/authentication",
      icon: Lock,
    },
    {
      title: "Permissions",
      url: "/admin/permissions",
      icon: ShieldCheck,
    },
  ],

  config: [
    {
      title: "Email",
      url: "/admin/email",
      icon: MailCheck,
    },
    {
      title: "SMS",
      url: "/admin/sms",
      icon: SquareMousePointer,
    },
    {
      title: "Webhooks",
      url: "/admin/webhooks",
      icon: Webhook,
    },
    {
      title: "Domains",
      url: "/admin/domains",
      icon: Link2,
    },
    {
      title: "Keys Rotation",
      url: "/admin/keys",
      icon: KeyRound,
    },
  ],
};

export const AppSidebar: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [activeApp, setActiveApp] = useState(data.teams[0]);

  const pathName = usePathname();

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 flex-shrink-0 items-center justify-center rounded-lg">
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

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-widest">General</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.main.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathName === item.url}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-widest">Users</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.users.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathName === item.url}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-widest">Configuration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.config.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathName === item.url}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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

      <SidebarInset>{children}</SidebarInset>
    </>
  );
};
