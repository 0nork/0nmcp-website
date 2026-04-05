"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { color } from "@/lib/type"

const checkboxVariants = cva(
  "peer  group shrink-0 ring-offset-background dark:ring-offset-card  bg-default-300/70 transition-all duration-300 data-[state=checked]:outline-hidden data-[state=checked]:ring-2 data-[state=checked]:ring-ring data-[state=checked]:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50  rounded h-4 w-4 [&_svg]:stroke-default-foreground [&_svg]:h-3.5 [&_svg]:w-3.5 cursor-pointer",
  {
    variants: {
      color: {
        default:
          "data-[state=checked]:border-default data-[state=checked]:bg-default data-[state=checked]:ring-default",
        primary:
          "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:ring-primary [&_svg]:stroke-white",
        secondary:
          "data-[state=checked]:bg-secondary data-[state=checked]:ring-secondary  [&_svg]:stroke-secondary-foreground",
        destructive:
          "data-[state=checked]:border-destructive data-[state=checked]:bg-destructive data-[state=checked]:ring-destructive [&_svg]:stroke-destructive-foreground",
        warning:
          "data-[state=checked]:border-warning data-[state=checked]:bg-warning data-[state=checked]:ring-warning [&_svg]:stroke-warning-foreground",
        info: "data-[state=checked]:border-info data-[state=checked]:bg-info data-[state=checked]:ring-info [&_svg]:stroke-info-foreground",
        success:
          "data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=checked]:ring-success [&_svg]:stroke-success-foreground",
      },
    },
    defaultVariants: {
      color: "default",
    },
  }
);


type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> &
  VariantProps<typeof checkboxVariants> & {
    color?: color
    icon?: React.ReactNode;
  };


const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, color, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      checkboxVariants({ color }),
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current ")}
    >
      <Check className="h-3 w-3" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox }
