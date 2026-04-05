"use client";
import React from "react";
import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";

const HeaderContent = ({ children }: { children: React.ReactNode }) => {
  const [config] = useConfig();

  if (config.sidebar === "two-column") {
    return (
      <header
        className={cn("top-0 z-50", config.navbar, {
          "has-sticky-header sticky top-6  px-6 ": config.navbar === "floating",
        })}
      >
        <div
          className={cn(
            "flex-none   bg-header backdrop-blur-lg md:px-6 px-[15px] py-3    xl:ms-[300px] flex items-center justify-between  relative",
            {
              "xl:ms-[72px]": config.subMenu || !config.hasSubMenu,
              "border-b":
                config.skin === "bordered" && config.layout !== "semi-box",
              "xl:ms-0": config.menuHidden || config.layout === "horizontal",
              border:
                config.skin === "bordered" && config.layout === "semi-box",
              "shadow-base": config.skin === "default",
              "rounded-md": config.navbar === "floating",
            }
          )}
        >
          {children}
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn("top-0 z-50", config.navbar, {
        [`dark theme-${config.headerColor}`]: config.headerColor !== "light",
        "has-sticky-header sticky top-6  px-6 ": config.navbar === "floating",
        "top-10 has-sticky-header": config.layout === "compact",
        "has-sticky-header":
          config.layout === "semi-box" && config.navbar !== "floating",
        "top-0 px-0":
          config.layout === "semi-box" && config.navbar === "floating",
      })}
    >
      <div
        className={cn(
          "flex-none    bg-header backdrop-blur-lg md:px-6 px-[15px] py-3    xl:ms-[248px]  flex items-center justify-between relative ",
          {
            "xl:ms-[72px]": config.collapsed,
            "border-b":
              config.skin === "bordered" && config.layout !== "semi-box",
            border: config.skin === "bordered" && config.layout === "semi-box",
            "shadow-base": config.skin === "default",
            "xl:ms-0": config.menuHidden || config.layout === "horizontal",
            "top-6 rounded-md": config.layout === "semi-box",
            "xl:ms-28":
              config.sidebar === "compact" && config.layout !== "horizontal",
            "rounded-md": config.navbar === "floating",
          }
        )}
      >
        {children}
      </div>
    </header>
  );
};

export default HeaderContent;
