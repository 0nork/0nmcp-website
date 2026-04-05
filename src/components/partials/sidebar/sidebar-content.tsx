"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useConfig } from "@/hooks/use-config";
import { useMenuHoverConfig } from "@/hooks/use-menu-hover";

const SidebarContent = ({ children }: { children: React.ReactNode }) => {
  const [config] = useConfig();
  const [hoverConfig, setHoverConfig] = useMenuHoverConfig();
  if (config.menuHidden || config.layout === "horizontal") return null;

  if (config.sidebar === "two-column") {
    return (
      <aside className={cn("fixed z-50 h-full xl:flex hidden", {})}>
        <div className=" relative flex h-full ">{children}</div>
      </aside>
    );
  }

  return (
    <aside
      onMouseEnter={() =>
        config.sidebar === "classic" && setHoverConfig({ hovered: true })
      }
      onMouseLeave={() =>
        config.sidebar === "classic" && setHoverConfig({ hovered: false })
      }
      className={cn(
        "fixed z-50 w-[248px] bg-sidebar shadow-base xl:block hidden ",
        {
          [`dark theme-${config.sidebarColor}`]:
            config.sidebarColor !== "light",
          "w-[72px]": config.collapsed && config.sidebar !== "compact",
          "border-b": config.skin === "bordered",
          "shadow-base": config.skin === "default",
          "h-full start-0":
            config.layout !== "semi-box" && config.layout !== "compact",
          "m-6 bottom-0 top-0  start-0   rounded-md":
            config.layout === "semi-box",
          "m-10 bottom-0 top-0  start-0   ": config.layout === "compact",
          "w-28": config.sidebar === "compact",
          "w-[248px]": hoverConfig.hovered,
        }
      )}
    >
      <div className=" relative  flex flex-col h-full  ">
        {config.sidebarBgImage !== undefined && (
          <div
            className=" absolute left-0 top-0   z-[-1] w-full h-full bg-cover bg-center opacity-[0.07]"
            style={{ backgroundImage: `url(${config.sidebarBgImage})` }}
          ></div>
        )}
        {children}
      </div>
    </aside>
  );
};

export default SidebarContent;
