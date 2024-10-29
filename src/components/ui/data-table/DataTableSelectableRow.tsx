import { Row } from "@tanstack/react-table";
import { Checkbox } from "../Checkbox";

export type DataTableSelectableRowProps<T> = {
  row: Row<T>;
};

export function DataTableSelectableRow<T>({ row }: DataTableSelectableRowProps<T>) {
  return (
    <>
      <div className="flex items-center space-x-4">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    </>
  );
}
