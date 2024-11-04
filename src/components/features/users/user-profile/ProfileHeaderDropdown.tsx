import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@trustify/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@trustify/components/ui/DropdownMenu";
import { type FunctionComponent } from "react";

export const ProfileHeaderDropdown: FunctionComponent = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Suspend</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Delete User</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
