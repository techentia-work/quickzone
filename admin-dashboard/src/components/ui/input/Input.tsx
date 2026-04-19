import React, { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Edit2 } from "lucide-react";

// ✅ Unified input props without name conflict
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  name?: string;
  classes?: string;
  label?: string;
  error?: string;
  success?: string;
  errLabel?: boolean;
  markAsRequired?: boolean;
  pencilEnabled?: boolean;
  variant?: "default" | "filled" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  style?: { [key: string]: string };
}

// ✅ Input style variants
const inputVariants = {
  variant: {
    default: "bg-white border-gray-300 focus:ring-green-600",
    filled: "bg-gray-100 border-gray-200 focus:ring-green-600",
    outline: "border border-green-600 focus:ring-green-600",
    danger: "border-red-500 focus:ring-red-500",
  },
  size: {
    sm: "px-3 py-2 text-sm rounded-md",
    md: "px-4 py-3 text-base rounded-lg",
    lg: "px-5 py-4 text-lg rounded-xl",
  },
};

// ✅ Main Input Component
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      name,
      label,
      type = "text",
      value,
      placeholder,
      onChange,
      error,
      success,
      classes,
      variant = "default",
      size = "md",
      errLabel = true,
      markAsRequired = false,
      pencilEnabled = false,
      style,
      className,
      ...rest
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success);

    return (
      <div className={cn("flex flex-col w-full gap-2", classes, className)}>
        {label && (
          <label htmlFor={name} className="flex justify-between w-full items-center">
            <div className="relative">
              <p className="text-xl leading-[25.7px]">{label}</p>
              {markAsRequired && (
                <span className="text-[22px] text-[#EB001B] absolute -top-1.5 -right-2.5">*</span>
              )}
            </div>
            {pencilEnabled && <Edit2 className="w-4 h-4 opacity-70" />}
          </label>
        )}

        <div className="relative w-full">
          <input
            ref={ref}
            id={name}
            name={name}
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className={cn(
              "w-full text-base leading-5 pl-7.5 pr-12 py-5.5 rounded-[14px] border-[1.25px] focus:outline-none focus:ring-2 transition-all",
              inputVariants.variant[hasError ? "danger" : variant],
              inputVariants.size[size],
              hasError ? "border-[#ff3131] focus:ring-[#ff3131]" : "border-gray-300 focus:ring-green-600",
              "bg-[#f3f4f6]",
              className
            )}
            style={style}
            {...rest}
          />
          {hasError && <XCircle className="absolute right-3 top-5 w-5 h-5 text-red-500" />}
          {hasSuccess && <CheckCircle className="absolute right-3 top-5 w-5 h-5 text-green-500" />}
        </div>

        {errLabel && (
          <p
            className={cn(
              "w-full text-sm leading-[25.89px] text-start min-h-[1.6rem]",
              hasError ? "text-[#ff3131] font-normal" : hasSuccess ? "text-[#1bcc00] font-light" : ""
            )}
          >
            {error || success}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";