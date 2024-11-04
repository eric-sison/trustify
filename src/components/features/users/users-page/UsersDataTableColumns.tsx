"use client";

import { AvatarImage } from "@radix-ui/react-avatar";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@trustify/components/ui/Avatar";
import { Badge } from "@trustify/components/ui/Badge";
import { DataTableColumnHeader } from "@trustify/components/ui/data-table/DataTableColumnHeader";
import { DataTableRowActions } from "./UsersDataTableRowActions";
import { UserData } from "@trustify/core/types/user";

export const columns: ColumnDef<UserData, unknown>[] = [
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
    accessorKey: "phoneNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contact Number" />,
    cell: ({ row }) => <p>{row.original.phoneNumber}</p>,
    enableSorting: false,
  },

  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => {
      return (
        <div className="flex max-w-56">
          <h3 className="truncate">{row.original.email}</h3>
        </div>
      );
    },
  },

  {
    accessorKey: "emailVerified",
    accessorFn: (column) => column.emailVerified.toString(),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      function evaluateStatus(emailVerified: boolean, suspended: boolean) {
        if (emailVerified && !suspended) {
          return {
            email: "Verified",
            suspended: "Active",
            status: "bg-green-500",
          };
        } else if (!emailVerified && suspended) {
          return {
            email: "Not Verified",
            suspended: "Suspended",
            status: "bg-rose-500",
          };
        } else if (!emailVerified || suspended) {
          return {
            email: row.original.emailVerified ? "Verified" : "Not Verified",
            suspended: row.original.suspended ? "Suspended" : "Active",
            status: "bg-orange-500",
          };
        } else {
          return null;
        }
      }

      const result = evaluateStatus(row.original.emailVerified, row.original.suspended);

      return (
        <div className="flex items-center gap-2">
          <div className={`${result?.status} h-2 w-2 rounded-full`} />
          <section className="space-x-1">
            <Badge variant="secondary">{result?.email}</Badge>
            <Badge variant="secondary">{result?.suspended}</Badge>
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
