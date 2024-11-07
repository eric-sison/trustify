import { Avatar, AvatarFallback, AvatarImage } from "@trustify/components/ui/Avatar";
import { type FunctionComponent } from "react";
import { clients } from "@trustify/db/schema/clients";

export const ApplicationDetailsHeader: FunctionComponent<{ app: typeof clients.$inferSelect }> = ({
  app,
}) => {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-muted/80 px-7 py-5 dark:border-muted/50 dark:bg-muted/20">
      <section className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={app.logo ?? "/default_app_logo.png"} alt={app.name} />
          <AvatarFallback className="text-3xl uppercase">{app.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="scroll-m-20 text-lg font-semibold tracking-wide">{app.name}</h4>
          <div>
            <p className="text-base text-muted-foreground">{app.description}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
