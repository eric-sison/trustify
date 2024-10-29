"use client";

import { AvatarImage } from "@radix-ui/react-avatar";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@trustify/components/ui/Avatar";
import { Badge } from "@trustify/components/ui/Badge";
import { DataTableColumnHeader } from "@trustify/components/ui/data-table/DataTableColumnHeader";
import { UserAddressSchema } from "@trustify/core/schemas/user-schema";
import { USER_GENDER, USER_ROLES } from "@trustify/utils/constants";
import { z } from "zod";
import { DataTableRowActions } from "./UsersDataTableRowActions";
import { Button } from "@trustify/components/ui/Button";
import { CopyIcon } from "lucide-react";
import { TooltipContent, TooltipProvider } from "@trustify/components/ui/Tooltip";
import { Tooltip, TooltipTrigger } from "@radix-ui/react-tooltip";

type UserColumn = {
  id: string;
  role: (typeof USER_ROLES)[number];
  email: string;
  givenName: string;
  middleName: string;
  familyName: string;
  nickname: string | null;
  preferredUsername: string | null;
  profile: string | null;
  picture: string | null;
  website: string | null;
  emailVerified: boolean;
  suspended: boolean;
  gender: (typeof USER_GENDER)[number] | null;
  birthdate: string | null;
  locale: string | null;
  zoneinfo: string | null;
  phoneNumber: string | null;
  phoneNumberVerified: boolean;
  address: z.infer<typeof UserAddressSchema> | null;
  createdAt: string;
  updatedAt: string;
};

export const usersColumns: ColumnDef<UserColumn, unknown>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="User ID" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <p>{row.original.id}</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="px-2 text-xs">
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },

  {
    accessorKey: "picture",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Avatar" />,
    cell: ({ row }) => {
      //   console.log(, "<===");
      return (
        <Avatar>
          <AvatarImage src={row.getValue("picture")} />
          <AvatarFallback className="font-semibold tracking-wider">
            {row.original.givenName.charAt(0)}
            {row.original.familyName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      );
    },
    enableColumnFilter: false,
    enableSorting: false,
  },

  {
    accessorKey: "preferredUsername",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Display Name" />,
    cell: ({ row }) => {
      return (
        <div className="max-w-56">
          <h3 className="truncate">
            {row.original.givenName} {row.original.middleName} {row.original.familyName}
          </h3>
          <p className="text-muted-foreground">{row.original.preferredUsername}</p>
        </div>
      );
    },
    enableColumnFilter: false,
  },

  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => {
      return (
        <div className="max-w-56 space-y-1">
          <h3 className="truncate">{row.original.email}</h3>
          {row.original.emailVerified ? (
            <Badge variant="success">Verified</Badge>
          ) : (
            <Badge variant="destructive">Not Verified</Badge>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "suspended",
    accessorFn: (column) => <p className="capitalize">{column.suspended.toString()}</p>,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Suspended" />,
    cell: ({ row }) => (
      <Badge variant="secondary" className="uppercase tracking-widest">
        {`${row.original.suspended}`}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
    enableColumnFilter: true,
  },

  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
