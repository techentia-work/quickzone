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
        "bg-white border border-gray-100 rounded-2xl transition-all duration-300",
        shadow && "shadow-sm",
        hover && "hover:shadow-xl hover:-translate-y-1",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

// ---------- Card Header ----------
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 border-b border-gray-50", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// ---------- Card Title ----------
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-bold text-gray-900", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// ---------- Card Description ----------
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 mt-1", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// ---------- Card Content ----------
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

// ---------- Export All ----------
export { Card, CardHeader, CardTitle, CardDescription, CardContent };
