import { type FunctionComponent } from "react";

type PageContent = {
  title: string;
  subtitle?: string;
  content: JSX.Element;
};

export const PageContent: FunctionComponent<PageContent> = ({ title, subtitle, content }) => {
  return (
    <div className="grid rounded-xl border bg-muted/80 p-7 dark:border-muted/50 dark:bg-muted/20 sm:grid-cols-1 lg:grid-cols-3">
      <div className="col-span-1 space-y-4 pr-10 sm:mb-7">
        <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{title}</h4>
        <p className="text-sm tracking-wide text-muted-foreground">{subtitle}</p>
      </div>
      <div className="col-span-2">{content}</div>
    </div>
  );
};
