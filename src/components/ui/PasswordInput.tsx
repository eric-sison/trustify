"use client";

import React, { useState } from "react";
import { Input } from "./Input";
import { Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "./Tooltip";

export const PasswordInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentPropsWithoutRef<typeof Input>
>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex items-center justify-between">
      <Input autoComplete="on" type={showPassword ? "text" : "password"} ref={ref} {...props} />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {!showPassword ? (
              <Eye
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 z-10 h-8 w-8 cursor-pointer bg-transparent p-1 text-gray-500"
              />
            ) : (
              <EyeOff
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 z-10 h-8 w-8 cursor-pointer bg-transparent p-1 text-gray-500"
              />
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>{!showPassword ? "Show Password" : "Hide Password"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";
