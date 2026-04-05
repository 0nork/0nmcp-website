"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { color, rounded, shadow } from "@/lib/type";

const alertVariants = cva(
  "relative w-full py-[18px] px-6 font-normal text-sm rounded-md flex md:items-center items-start gap-4",
  {
    variants: {
      color: {
        default: "bg-default text-default-foreground",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-success text-success-foreground",
        info: "bg-info text-info-foreground",
        warning: "bg-warning text-warning-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      variant: {
        outline: "border border-default text-default bg-transparent",
        soft: "text-default bg-default/10",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        color: "primary",
        className: "text-primary  border-primary",
      },
      {
        variant: "outline",
        color: "secondary",
        className: "text-default-400 border-secondary ",
      },
      {
        variant: "outline",
        color: "success",
        className: "text-success border-success",
      },
      {
        variant: "outline",
        color: "info",
        className: "text-info border-info",
      },
      {
        variant: "outline",
        color: "warning",
        className: "text-warning border-warning",
      },
      {
        variant: "outline",
        color: "destructive",
        className: "text-destructive border-destructive",
      },
      {
        variant: "soft",
        color: "primary",
        className: "text-primary bg-primary/10",
      },
      {
        variant: "soft",
        color: "secondary",
        className: "text-default-500 bg-secondary/80",
      },
      {
        variant: "soft",
        color: "success",
        className: "text-success bg-success/10",
      },
      {
        variant: "soft",
        color: "info",
        className: "text-info bg-info/10",
      },
      {
        variant: "soft",
        color: "warning",
        className: "text-warning bg-warning/10",
      },
      {
        variant: "soft",
        color: "destructive",
        className: "text-destructive bg-destructive/10",
      }
    ],
    defaultVariants: {
      color: "default",
    }
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof alertVariants> {
  dismissible?: boolean;
  onDismiss?: () => void;
  color?: color;
  shadow?: shadow;
  rounded?: rounded;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, color, variant, dismissible, onDismiss, children, ...props }, ref) => {
    const [dismissed, setDismissed] = React.useState(false);

    const handleDismiss = () => {
      setDismissed(true);
      if (onDismiss) {
        onDismiss();
      }
    };

    return !dismissed ? (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ color, variant }), className)}
        {...props}
      >
        {children}
        {dismissible && (
          <button onClick={handleDismiss} className="grow-0">
            <Icon icon="heroicons:x-mark" className="w-5 h-5" />
          </button>
        )}
      </div>
    ) : null;
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-2 font-medium leading-none tracking-tight grow text-lg", className)}
      {...props}
    />
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed grow flex items-center gap-1.5", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

