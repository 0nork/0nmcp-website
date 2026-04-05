import * as React from "react";
import { cn } from "@/lib/utils";

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  merged?: boolean

}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, merged, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex relative flex-wrap items-stretch w-full group input-group  ltr:flex-row rtl:flex-row-reverse group-focus-within:border-default dark:group-focus-within:border-default-500 ",
        className,
        {
          merged: merged,
        }
      )}
      {...props}
    />
  )
);
InputGroup.displayName = "InputGroup";

const InputGroupButton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "first:*:rounded-r-none last:*:rounded-l-none focus:border-default dark:focus:border-default-500",
      className
    )}
    {...props}
  />
));
InputGroupButton.displayName = "InputGroupButton";

const InputGroupText = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, color, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "border border-default-200 text-default-500 text-sm font-normal  bg-background flex items-center justify-center px-3 first:border-r-0 last:border-l-0 first:rounded-l-md last:rounded-r-md group-focus-within:border-default dark:group-focus-within:border-default-500 ring-default  transition duration-300",
        className,
        {
          "border-primary/50": color === "primary",
          "border-secondary/50": color === "secondary",
          "border-warning/50 ": color === "warning",
          "border-info/50 ": color === "info",
          "border-success/50": color === "success",
          "border-destructive/50 ": color === "destructive"
        }
      )}
      {...props}
    />
  )
);
InputGroupText.displayName = "InputGroupText";

export { InputGroup, InputGroupButton, InputGroupText };
