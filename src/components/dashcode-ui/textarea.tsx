import * as React from "react";

import { cn } from "@/lib/utils";

import { cva, type VariantProps } from "class-variance-authority";
import { InputColor, radius } from "@/lib/type";

export const textareaVariants = cva(
  "flex flex-1 bg-background w-full min-h-[80px] rounded-md border border-solid   px-3 py-[10px] text-sm  file:border-0 file:bg-transparent file:text-sm file:font-medium  read-only:bg-background read-only:text-default-500 disabled:cursor-not-allowed disabled:opacity-50  transition duration-300 ",
  {
    variants: {
      color: {
        default:
          "border-default-200 text-default focus:outline-hidden focus:border-default disabled:bg-default-200  placeholder:text-accent-foreground/50",
        primary:
          "border-primary text-primary focus:outline-hidden focus:border-primary-700 disabled:bg-primary/30 disabled:placeholder:text-primary  placeholder:text-primary/70",
        secondary:
          "border-secondary text-secondary focus:outline-hidden focus:border-secondary-700 disabled:bg-secondary/30 disabled:placeholder:text-secondary  placeholder:text-secondary/70",
        info: "border-info/50 text-info focus:outline-hidden focus:border-info-700 disabled:bg-info/30 disabled:placeholder:text-info  placeholder:text-info/70",
        warning:
          "border-warning/50 text-warning focus:outline-hidden focus:border-warning-700 disabled:bg-warning/30 disabled:placeholder:text-info  placeholder:text-warning/70",
        success:
          "border-success/50 text-success focus:outline-hidden focus:border-success-700 disabled:bg-success/30 disabled:placeholder:text-info  placeholder:text-success/70",
        destructive:
          "border-destructive/50 text-destructive focus:outline-hidden focus:border-destructive-700 disabled:bg-destructive/30 disabled:placeholder:text-destructive  placeholder:text-destructive/70",
      },

    },

    defaultVariants: {
      color: "default",
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  VariantProps<typeof textareaVariants> {
  color?: InputColor
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, color,  defaultValue, ...props }, ref) => {
    return (
      <div className="flex-1 w-full">
        <textarea
          className={cn(
            textareaVariants({ color }),
            className
          )}
          ref={ref}
          {...props}
        >
          {defaultValue}
        </textarea>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

