import { Avatar, AvatarFallback, AvatarImage } from "@trustify/components/ui/Avatar";
import { DEFAULT_COLORS } from "@trustify/utils/constants";
import { type FunctionComponent } from "react";
import { ProfileHeaderDropdown } from "./ProfileHeaderDropdown";

type ProfileHeaderProps = {
  avatarUrl: string | null;
  email: string;
  username: string;
  defaultColor: (typeof DEFAULT_COLORS)[number];
};

export const ProfileHeader: FunctionComponent<ProfileHeaderProps> = ({
  avatarUrl,
  email,
  defaultColor,
  username,
}) => {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-muted/80 px-7 py-5 dark:border-muted/50 dark:bg-muted/20">
      <section className="flex items-center gap-5">
        <Avatar className="h-14 w-14">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback className="text-3xl uppercase" defaultColor={defaultColor}>
            {email.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{email}</h4>
          <div>
            <p className="text-wide text-sm font-semibold text-muted-foreground">{username}</p>
          </div>
        </div>
      </section>

      <ProfileHeaderDropdown />
    </div>
  );
};
