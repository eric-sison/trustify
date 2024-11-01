import { type FunctionComponent } from "react";
import { useSidebar } from "./Sidebar";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip";

export const SidebarCustomTrigger: FunctionComponent = () => {
  const { toggleSidebar, state } = useSidebar();

  return (
    <button onClick={toggleSidebar}>
      {state === "expanded" ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PanelLeftClose className="h-5 w-5" />
            </TooltipTrigger>
            <TooltipContent>Collapse</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PanelRightClose className="h-5 w-5" />
            </TooltipTrigger>
            <TooltipContent>Expand</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </button>
  );
};
