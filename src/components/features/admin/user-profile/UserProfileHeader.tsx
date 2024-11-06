import { Avatar, AvatarFallback, AvatarImage } from "@trustify/components/ui/Avatar";
import { type FunctionComponent } from "react";
import { UserProfileHeaderDropdown } from "./UserProfileHeaderDropdown";
import { UserData } from "@trustify/core/types/user";

export const UserProfileHeader: FunctionComponent<{ user: UserData }> = ({ user }) => {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-muted/80 px-7 py-5 dark:border-muted/50 dark:bg-muted/20">
      <section className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.picture ?? undefined} alt={user.preferredUsername} />
          <AvatarFallback className="text-3xl uppercase" defaultColor={user.metadata?.defaultColor}>
            {user.email.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="scroll-m-20 text-lg font-semibold tracking-tight">{user.email}</h4>
          <div>
            <p className="text-wide text-base font-semibold text-muted-foreground">
              {user.preferredUsername}
            </p>
          </div>
        </div>
      </section>

      {/* <Button variant="destructive">Delete User</Button> */}
      <UserProfileHeaderDropdown />
    </div>
  );
};
