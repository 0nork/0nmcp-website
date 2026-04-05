"use client";
import React, { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

// for dnd

import { useSortable } from "@dnd-kit/sortable";
interface MenuItemProps {
  id: string;
  href: string;
  label: string;
  icon: string;
  active: boolean;
  collapsed: boolean;
}
import { CSS } from "@dnd-kit/utilities";
import { useConfig } from "@/hooks/use-config";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMobileMenuConfig } from "@/hooks/use-mobile-menu";
import { useMenuHoverConfig } from "@/hooks/use-menu-hover";
const MenuItem = ({
  href,
  label,
  icon,
  active,
  id,
  collapsed,
}: MenuItemProps) => {
  const [config] = useConfig();
  const [hoverConfig] = useMenuHoverConfig();
  const { hovered } = hoverConfig;
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const [mobileMenuConfig, setMobileMenuConfig] = useMobileMenuConfig();
  const {
    transform,
    transition,
    setNodeRef,
    isDragging,
    attributes,
    listeners,
  } = useSortable({
    id: id,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
  };
  if (config.sidebar === "draggable" && isDesktop) {
    return (
      <Button
        ref={setNodeRef}
        style={style}
        variant={active ? "default" : "ghost"}
        color={active ? "default" : "secondary"}
        fullWidth
                     className={cn(
                                          "hover:ring-transparent hover:ring-offset-0 justify-start text-sm font-medium capitalize group md:hover:px-8 h-auto py-3 md:px-3 px-3",
                                          {
                                            "bg-secondary text-default hover:bg-secondary":
                                              active && config.sidebarColor !== "light",
                                          }
                                        )}
        asChild
        size={collapsed ? "icon" : "default"}
      >
        <Link
          href={href}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {!collapsed && (
            <GripVertical
              {...attributes}
              {...listeners}
              className={cn(
                "inset-t-0 absolute me-1 h-5 w-5 ltr:-translate-x-6 rtl:translate-x-6 invisible opacity-0 group-hover:opacity-100 transition-all group-hover:visible group-hover:ltr:-translate-x-5 group-hover:rtl:translate-x-5",
                {}
              )}
            />
          )}
          <Icon
            icon={icon}
            className={cn("h-5 w-5 ", {
              "me-2": !collapsed,
            })}
          />
          {!collapsed && (
            <p className={cn("max-w-[200px] truncate")}>{label}</p>
          )}
        </Link>
      </Button>
    );
  }

  if (config.sidebar === "compact" && isDesktop) {
    return (
      <Button
        variant={active ? "default" : "ghost"}
        fullWidth
        color={active ? "default" : "secondary"}
        className={cn(
          "hover:ring-transparent hover:ring-offset-0 flex-col h-auto py-1.5 px-3.5 capitalize font-semibold",
          {
            "bg-secondary text-default hover:bg-secondary":
              active && config.sidebarColor !== "light",
          }
        )}
        asChild
      >
        <Link href={href}>
          <Icon icon={icon} className={cn("h-6 w-6 mb-1 ")} />

          <p className={cn("max-w-[200px]  text-[11px] truncate ")}>{label}</p>
        </Link>
      </Button>
    );
  }
  return (
    <Button
      onClick={() =>
        setMobileMenuConfig({ ...mobileMenuConfig, isOpen: false })
      }
      variant={active ? "default" : "ghost"}
      fullWidth
      color={active ? "default" : "secondary"}
      className={cn("hover:ring-transparent hover:ring-offset-0", {
        "justify-start text-sm font-medium capitalize h-auto py-3 md:px-3 px-3":
          !collapsed || hovered,
        "bg-secondary text-default hover:bg-secondary":
          active && config.sidebarColor !== "light",
      })}
      asChild
      size={collapsed && !hovered ? "icon" : "default"}
    >
      <Link href={href}>
        <Icon
          icon={icon}
          className={cn("h-5 w-5 ", {
            "me-2": !collapsed || hovered,
          })}
        />
        {(!collapsed || hovered) && (
          <p className={cn("max-w-[200px] truncate")}>{label}</p>
        )}
      </Link>
    </Button>
  );
};

export default MenuItem;
