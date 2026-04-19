import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  shadow?: boolean;
  hover?: boolean;
}

// ---------- Root Card ----------
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, shadow = true, hover = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white border border-gray-200 rounded-xl transition-all",
        shadow && "shadow-sm",
        hover && "hover:shadow-md hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

// ---------- Card Header ----------
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-5 border-b border-gray-100", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

// ---------- Card Title ----------
const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold text-gray-900", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

// ---------- Card Description ----------
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

// ---------- Card Content ----------
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

// ---------- Export All ----------
export { Card, CardHeader, CardTitle, CardDescription, CardContent };
