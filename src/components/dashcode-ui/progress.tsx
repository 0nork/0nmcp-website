"use client"
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { color, size } from "@/lib/type";

const progressVariants = cva(
  "relative overflow-hidden rounded-full bg-default-200 dark:bg-default-300",
  {
    variants: {
      color: {
        default: "[&>div]:bg-default",
        primary: "[&>div]:bg-primary",
        secondary: "[&>div]:bg-secondary",
        destructive: "[&>div]:bg-destructive",
        warning: "[&>div]:bg-warning",
        info: "[&>div]:bg-info",
        success: "[&>div]:bg-success",
      },
      size: {
        sm: "h-2",
        default: "h-3",
        md: "h-3.5",
        lg: "h-4",
      }
    },
    defaultVariants: {
      color: "default",
      size: "default",
    },
  }
);

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  size?: size,
  value?: number,
  showValue?: boolean,
  color?: color,
  isStripe?: boolean,
  isAnimate?: boolean
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(({ className, value, color, size, showValue, isStripe, isAnimate, ...props }, ref) => {
  const stripeStyles = isStripe
    ? {
      backgroundImage: `linear-gradient(
          45deg,
          hsla(0, 0%, 100%, 0.15) 25%,
          transparent 0,
          transparent 50%,
          hsla(0, 0%, 100%, 0.15) 0,
          hsla(0, 0%, 100%, 0.15) 75%,
          transparent 0,
          transparent
        )`,
      backgroundSize: "0.857rem 0.857rem",
    }
    : {};
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        progressVariants({ color, size }),
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "flex-1 transition-all h-full w-full flex items-center justify-center",
          className,
          {
            "animate-stripes": isAnimate,
          }
        )}
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          ...stripeStyles,
        }}
      >
        {showValue && (
          <span className="text-end pe-1 text-xs  text-primary-foreground block w-full">
            {value}%
          </span>
        )}
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );
}
);
Progress.displayName = ProgressPrimitive.Root.displayName;


export { Progress };
