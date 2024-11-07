import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@trustify/components/ui/Badge";
import { DataTableColumnHeader } from "@trustify/components/ui/data-table/DataTableColumnHeader";
import { ClientSummary } from "@trustify/core/types/clients";
import { ApplicationsDataTableRowActions } from "./ApplicationsDataTableRowActions";

export const clientsDataTableColumns: ColumnDef<ClientSummary, unknown>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Application ID" />,
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
    accessorKey: "logo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Application Logo" />,
    cell: ({ row }) => (
      <div className="max-w-64">
        {row.original.logo ? (
          <p className="truncate">{row.original.logo}</p>
        ) : (
          <p className="text-muted-foreground">No data</p>
        )}
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },

  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },

  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => (
      <div className="max-w-64">
        {row.original.description ? (
          <p className="truncate" title={row.original.description}>
            {row.original.description}
          </p>
        ) : (
          <p className="text-muted-foreground">No data</p>
        )}
      </div>
    ),
    enableColumnFilter: false,
    enableSorting: false,
  },

  {
    accessorKey: "isActive",
    accessorFn: (column) => (column.isActive ? "Active" : "Inactive"),
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <div className={`${row.original.isActive ? "bg-green-600" : "bg-rose-600"} h-2 w-2 rounded-full`} />
          <section className="space-x-1">
            <Badge variant="secondary">{row.original.isActive ? "Active" : "Inactive"}</Badge>
          </section>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },

  {
    id: "actions",
    cell: ({ row }) => <ApplicationsDataTableRowActions row={row} />,
  },
];
