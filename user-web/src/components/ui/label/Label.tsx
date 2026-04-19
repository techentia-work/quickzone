import React from "react";
import { cn } from "@/lib/utils";

const labelSizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  size?: keyof typeof labelSizes;
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ size = "md", required, children, className, ...props }) => {
  return (
    <label
      className={cn("font-medium text-gray-800 flex items-center gap-1", labelSizes[size], className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500">*</span>}
    </label>
  );
};