"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { color, rounded } from "@/lib/type";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "base" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  color?: color;
  variant?: "default" | "outline" | "soft" | "ghost";
  rounded?: rounded;
}

const avatarVariant = cva(
  "inline-flex items-center justify-center font-normal text-foreground select-none shrink-0  overflow-hidden",
  {
    variants: {
      color: {
        default: "bg-default text-default-foreground hover:bg-default/90 hover:ring-default",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:ring-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:ring-secondary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:ring-destructive",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 hover:ring-warning",
        info: "bg-info text-info-foreground hover:bg-info/90 hover:ring-info",
        success: "bg-success text-success-foreground hover:bg-success/90 hover:ring-success",
      },
      variant: {
        default: "",
        outline: "border border-default text-default bg-transparent hover:bg-default hover:text-default-foreground hover:ring-0 hover:ring-transparent",
        soft: "text-default-foreground/10 hover:text-primary-foreground",
        ghost: "bg-transparent text-default hover:bg-transparent-10 hover:ring-0 hover:ring-transparent",
      },
      size: {
        sm: "h-10 w-10 text-xs",
        base: "h-16 w-16 text-2xl",
        md: "h-24 w-24 text-3xl",
        lg: "h-28 w-28 text-4xl",
        xl: "h-32 w-32 text-5xl",
      },
      rounded: {
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full"
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        color: "primary",
        class: "text-primary border-primary hover:text-primary-foreground hover:border-primary hover:bg-primary",
      },
      {
        variant: "outline",
        color: "secondary",
        class: "text-secondary border-secondary hover:text-secondary-foreground hover:border-secondary hover:bg-secondary",
      },
      {
        variant: "outline",
        color: "success",
        class: "text-success border-success hover:text-success-foreground hover:border-success hover:bg-success",
      },
      {
        variant: "outline",
        color: "info",
        class: "text-info border-info hover:text-info-foreground hover:border-info hover:bg-info",
      },
      {
        variant: "outline",
        color: "warning",
        class: "text-warning border-warning hover:text-warning-foreground hover:border-warning hover:bg-warning",
      },
      {
        variant: "outline",
        color: "destructive",
        class: "text-destructive border-destructive hover:text-destructive-foreground hover:border-destructive hover:bg-destructive",
      },
      {
        variant: "outline",
        color: "info",
        class: "text-info hover:text-info-foreground hover:border-info hover:bg-info",
      },
      {
        variant: "soft",
        color: "primary",
        class: "text-primary hover:text-primary-foreground",
      },
      {
        variant: "soft",
        color: "secondary",
        class: "text-secondary hover:text-secondary-foreground",
      },
      {
        variant: "soft",
        color: "success",
        class: "text-success hover:text-success-foreground",
      },
      {
        variant: "soft",
        color: "info",
        class: "text-info hover:text-info-foreground",
      },
      {
        variant: "soft",
        color: "warning",
        class: "text-warning hover:text-warning-foreground",
      },
      {
        variant: "soft",
        color: "destructive",
        class: "bg-destructive/10 text-destructive hover:text-destructive-foreground",
      },
      {
        variant: "ghost",
        color: "primary",
        class: "text-primary bg-primary/10",
      },
      {
        variant: "ghost",
        color: "secondary",
        class: "text-secondary-foreground bg-secondary/80",
      },
      {
        variant: "ghost",
        color: "success",
        class: "text-success bg-success/10",
      },
      {
        variant: "ghost",
        color: "info",
        class: "text-info bg-info/10",
      },
      {
        variant: "ghost",
        color: "warning",
        class: "text-warning bg-warning/10",
      },
      {
        variant: "ghost",
        color: "destructive",
        class: "text-destructive bg-destructive/10",
      },
      {
        variant: "ghost",
        color: "default",
        class: "text-default bg-default/10",
      },
    ],
    defaultVariants: {
      color: "default",
      size: "sm",
      rounded: "full",
      variant: "default"
    },
  }
);

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ size, shape, color, variant, rounded, className, ...props }, ref) => {
    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariant({ size, shape, color, variant, rounded }), className)}
        {...props}
      />
    );
  }
);
Avatar.displayName = AvatarPrimitive.Root.displayName;


export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> { }

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => {
    return (
      <AvatarPrimitive.Image
        ref={ref}
        className={cn("aspect-square h-full w-full object-cover", className)}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;


export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> { }

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => {
    return (
      <AvatarPrimitive.Fallback
        ref={ref}
        className={cn("font-medium flex items-center justify-center", className)}
        {...props}
      />
    );
  }
);
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;


export { Avatar, AvatarImage, AvatarFallback };

