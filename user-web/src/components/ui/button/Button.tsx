import React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  variant: {
    primary:
      "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg",
    secondary:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200",
    outline: "border-2 border-green-600 text-green-600 hover:bg-green-50",
    danger:
      "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg",
    hero: "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl",
  },
  size: {
    sm: "text-sm px-4 py-2 rounded-lg",
    md: "text-base px-5 py-2.5 rounded-xl",
    lg: "text-lg px-7 py-3.5 rounded-xl",
  },
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  isLoading,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        "font-semibold flex items-center justify-center transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105 active:scale-95",
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
      )}
      {isLoading ? "Processing..." : children}
    </button>
  );
};
