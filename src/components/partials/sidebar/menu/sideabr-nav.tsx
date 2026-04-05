"use client";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Group } from "@/lib/menus";
import { useParams, usePathname } from "next/navigation";
import { Link } from "@/components/navigation";
import { useConfig } from "@/hooks/use-config";
import { Button } from "@/components/ui/button";
import MenuLabel from "../common/menu-label";
import { Icon } from "@/components/ui/icon";
import { CollapseMenuButton2 } from "../common/collapse-menu-button2";
import TeamSwitcher from "../common/team-switcher";
import SearchBar from "../common/search-bar";
import { getLangDir } from "rtl-detect";
import { cn } from "@/lib/utils";
const SidebarNav = ({ menuList }: { menuList: Group[] }) => {
  const [config, setConfig] = useConfig();
  const pathname = usePathname();
  const params = useParams<{ locale: string }>();
  const direction = getLangDir(params?.locale ?? "");
  const activeKey = pathname?.split("/")?.[2];
  const data = menuList.find((item) => item.id === activeKey);

  // Render null if config.subMenu is true
  if (config.subMenu || !config.hasSubMenu) {
    return null;
  }

  return (
    <div
      className={cn("h-full bg-sidebar  shadow-base  w-[228px] relative z-20", {
        [`dark theme-${config.sidebarColor}`]: config.sidebarColor !== "light",
      })}
    >
      {config.sidebarBgImage !== undefined && (
        <div
          className=" absolute left-0 top-0  z-10 w-full h-full bg-cover bg-center opacity-[0.07]"
          style={{ backgroundImage: `url(${config.sidebarBgImage})` }}
        ></div>
      )}

      <ScrollArea className="[&>div>div[style]]:block! h-full" dir={direction}>
        <div className="px-4 space-y-3 mt-6">
          <TeamSwitcher />
          <SearchBar />
        </div>
        <div className="px-4 pt-6  sticky top-0  z-20">
          {data?.groupLabel && (
            <MenuLabel
              label={data?.groupLabel}
              className=" text-xl py-0 font-semibold  capitalize text-default "
            />
          )}
        </div>
        <nav className="mt-6 h-full w-full ">
          <div className=" h-full  space-y-1.5 flex flex-col  items-start  px-4 pb-8 ">
            {data?.menus.map(({ submenus }, index) =>
              submenus?.map(
                ({ href, label, active, icon, children: subChildren }, i) => (
                  <React.Fragment key={`double-menu-index-${i}`}>
                    {subChildren?.length === 0 ? (
                      <Button
                        asChild
                        color={active ? "default" : "secondary"}
                        variant={active ? "default" : "ghost"}
                        fullWidth
                        className={cn(
                          "h-10 capitalize justify-start md:px-3 px-3 hover:ring-transparent hover:ring-offset-0",
                          {
                            "bg-secondary text-default hover:bg-secondary":
                              active && config.sidebarColor !== "light",
                          }
                        )}
                      >

                        <Link href={href}>
                          {icon && (
                            <Icon icon={icon} className="h-5 w-5 me-2" />
                          )}

                          <p>{label}</p>
                        </Link>
                      </Button>
                    ) : (
                      subChildren && (
                        <CollapseMenuButton2
                          icon={icon}
                          label={label}
                          active={active}
                          submenus={subChildren}
                        />
                      )
                    )}
                  </React.Fragment>
                )
              )
            )}
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
};

export default SidebarNav;
