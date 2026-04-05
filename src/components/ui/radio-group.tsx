"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { color, size } from "@/lib/type"

const radioVariants = cva(
  "aspect-square h-[18px] w-[18px] rounded-full border border-default-400 data-[state=checked]:text-default-700 ring-offset-background  disabled:cursor-not-allowed disabled:bg-default-100 disabled:border-default-400 disabled:opacity-50 [&_svg]:fill-current [&_svg]:text-current transition-all duration-100",
  {
    variants: {
      color: {
        default:
          "data-[state=checked]:border-default data-[state=checked]:text-default",
        primary:
          "data-[state=checked]:border-primary data-[state=checked]:text-primary",
        secondary:
          "data-[state=checked]:border-default-300 data-[state=checked]:text-default-300",
        info: "data-[state=checked]:border-info data-[state=checked]:text-info",
        warning:
          "data-[state=checked]:border-warning data-[state=checked]:text-warning",
        success:
          "data-[state=checked]:border-success data-[state=checked]:text-success",
        destructive:
          "data-[state=checked]:border-destructive data-[state=checked]:text-destructive",
      },
      size: {
        sm: "h-4 w-4 [&_svg]:h-3 [&_svg]:w-3",
        default: "h-5 w-5 [&_svg]:h-4 [&_svg]:w-4",
        md: "h-6 w-6 [&_svg]:h-5 [&_svg]:w-5",
        lg: "h-7 w-7 [&_svg]:h-6 [&_svg]:w-6",
      },
    },
    compoundVariants: [],

    defaultVariants: {
      color: "default",
    }
  }
);

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
  VariantProps<typeof radioVariants> {
  icon?: React.ReactNode;
  color?: color;
  size?: size;
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, color,size, icon, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        radioVariants({ color,size }),
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        {icon || <Circle className="h-2.5 w-2.5 fill-current text-current" />}
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }

