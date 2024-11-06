"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@trustify/components/ui/Avatar";
import { Badge } from "@trustify/components/ui/Badge";
import { DataTableColumnHeader } from "@trustify/components/ui/data-table/DataTableColumnHeader";
import { DataTableRowActions } from "./UsersDataTableRowActions";
import { UserSummary } from "@trustify/core/types/user";
import { Info } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@trustify/components/ui/Tooltip";
import { Button } from "@trustify/components/ui/Button";

export const columns: ColumnDef<UserSummary, unknown>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="User ID" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-md font-mono font-normal">
            {row.original.id}
          </Badge>
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },

  {
    accessorKey: "picture",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Avatar" />,
    cell: ({ row }) => {
      return (
        <Avatar>
          <AvatarImage src={row.getValue("picture")} alt={row.getValue("preferredUsername")} />
          <AvatarFallback
            className="font-semibold uppercase"
            defaultColor={row.original.metadata?.defaultColor}
          >
            {row.original.email.charAt(0)}
            {row.original.email.charAt(1)}
          </AvatarFallback>
        </Avatar>
      );
    },
    enableColumnFilter: false,
    enableSorting: false,
  },

  {
    accessorKey: "preferredUsername",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
    cell: ({ row }) => {
      return (
        <div className="max-w-56">
          <p className="truncate text-muted-foreground">{row.original.preferredUsername}</p>
        </div>
      );
    },
    enableColumnFilter: false,
  },

  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      return (
        <div className="max-w-56">
          {row.original.name ? (
            <p className="truncate">{row.original.name}</p>
          ) : (
            <p className="text-muted-foreground">No data</p>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "phoneNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contact Number" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <p>{row.original.phoneNumber}</p>
          {!row.original.phoneNumberVerified && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-amber-500 dark:text-amber-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <span className="tracking-wide">Phone number is not yet verified</span>
                  <Button
                    variant="link"
                    onClick={() => console.log(`send verification code to ${row.original.phoneNumber}`)}
                    className="text-blue-600 dark:text-blue-500"
                  >
                    Send code
                  </Button>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },

  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <p>{row.original.email}</p>
          {!row.original.emailVerified && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-amber-500 dark:text-amber-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <span className="tracking-wide">Email is not yet verified</span>
                  <Button
                    variant="link"
                    onClick={() => console.log(`send verification code to ${row.original.email}`)}
                    className="text-blue-600 dark:text-blue-500"
                  >
                    Send code
                  </Button>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "suspended",
    accessorFn: (column, as) => (column.suspended ? "Suspended" : "Active"),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <div
            className={`${!row.original.suspended ? "bg-green-600" : "bg-rose-600"} h-2 w-2 rounded-full`}
          />
          <section className="space-x-1">
            <Badge variant="secondary">{row.original.suspended ? "Suspended" : "Active"}</Badge>
          </section>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },

  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
