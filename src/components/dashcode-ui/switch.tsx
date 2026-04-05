"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority";
import { color, size } from "@/lib/type";

const switchVariants = cva(
  "peer relative  inline-flex items-center  [&_.content-box>svg]:h-3  [&_.content-box>svg]:w-3  [&_.content-box]:text-primary-foreground [&_.content-box]:text-[10px] justify-start group  shrink-0  cursor-pointer rounded-full  transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-default-300",
  {
    variants: {
      color: {
        default: "data-[state=checked]:bg-default ",
        primary: "data-[state=checked]:bg-primary ",
        secondary: "data-[state=checked]:bg-secondary ",
        info: "data-[state=checked]:bg-info ",
        warning: "data-[state=checked]:bg-warning ",
        success: "data-[state=checked]:bg-success ",
        destructive: "data-[state=checked]:bg-destructive ",
        dark: "data-[state=checked]:bg-foreground ",
      },
      size: {
        sm: "h-4 w-[30px]  [&_.content-box]:text-[7px] [&_.content-box>svg]:h-2.5  [&_.content-box>svg]:w-2.5 ",
        default: "h-5 w-[38px] ",
        md: "h-6 w-[46px]",
        lg: "h-7 w-[48px] ",
      },
    },

    defaultVariants: {
      color: "default",
      size: "default",
    },
  }
);

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>, VariantProps<typeof switchVariants> {
  color?: color
  size?:size
  startContent?: React.ReactNode | string
  endContent?: React.ReactNode | string
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ color, size, startContent, endContent, className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(switchVariants({ color, size }), className)}
    {...props}
    ref={ref}
  >
    {startContent && (
      <span className="absolute left-1  content-box   text-medium opacity-0 scale-50 transition-transform-opacity group-data-[state=checked]:scale-100 group-data-[state=checked]:opacity-100 ">
        {startContent}
      </span>
    )}
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background dark:data-[state=unchecked]:bg-default-900 shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-[19px] data-[state=unchecked]:translate-x-[2px]",
        {
          "h-3.5 w-3.5 data-[state=checked]:translate-x-3.5 ": size === "sm",
          "h-5 w-5 data-[state=checked]:translate-x-6 ": size === "md",
          "h-5 w-5 data-[state=checked]:translate-x-[25px] ": size === "lg",
        }
      )}
    />
    {endContent && (
      <span className="z-0  content-box   absolute right-1  text-medium opacity-100 transition-transform-opacity group-data-[state=checked]:translate-x-3 group-data-[state=checked]:opacity-0  ">
        {endContent}
      </span>
    )}
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
