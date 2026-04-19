import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, size = "md", className, onCheckedChange, ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    }[size];

    return (
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            "appearance-none border border-gray-400 rounded-md checked:bg-green-600 checked:border-green-600 focus:ring-2 focus:ring-green-400 transition-all",
            sizeClasses,
            className
          )}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="font-medium text-gray-800">{label}</span>}
            {description && <span className="text-sm text-gray-500">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
