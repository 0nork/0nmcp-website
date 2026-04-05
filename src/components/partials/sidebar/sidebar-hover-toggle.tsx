"use client";
import React from "react";
import { useMenuHoverConfig } from "@/hooks/use-menu-hover";
import { cn } from "@/lib/utils";
import { useConfig } from "@/hooks/use-config";
import { useMediaQuery } from "@/hooks/use-media-query";

const SidebarHoverToggle = () => {
  const [hoverConfig, setHoverConfig] = useMenuHoverConfig();
  const [config, setConfig] = useConfig();

  const isDesktop = useMediaQuery("(min-width: 1280px)");
  if (config.sidebar !== "classic" || !isDesktop) {
    return null;
  }

  return !config.collapsed || hoverConfig.hovered ? (
    <div
      onClick={() => setConfig({ ...config, collapsed: !config.collapsed })}
      className={cn(
        "h-4 w-4 border-[1.5px] border-default-900 dark:border-default-700 rounded-full transition-all duration-150",
        {
          [`ring-0 ring-default-900 ring-offset-4 ring-offset-secondary ring-inset bg-default-900 dark:bg-${config.sidebarColor}`]:
            !config.collapsed,
        }
      )}
    ></div>
  ) : null;
};

export default SidebarHoverToggle;
