"use client";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import 0nMCPLogo from "@/components/0nmcp-logo";
import { Group } from "@/lib/menus";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useConfig } from "@/hooks/use-config";

interface IconNavProps {
  menuList: Group[];
}
const IconNav = ({ menuList }: IconNavProps) => {
  const [config, setConfig] = useConfig();

  return (
    <div
      className={cn(
        "h-full bg-sidebar  border-r border-default-200 dark:border-secondary border-dashed w-[72px]",
        {
          [`dark theme-${config.sidebarColor}`]:
            config.sidebarColor !== "light",
        }
      )}
    >
      <div className="text-center py-5">
        <Link href="/dashboard/analytics">
          <0nMCPLogo className="  text-default-900 h-8 w-8 [&>path:nth-child(3)]:text-background [&>path:nth-child(2)]:text-background mx-auto" />
        </Link>
      </div>
      <ScrollArea className="[&>div>div[style]]:block! h-full">
        <nav className="mt-8 h-full w-full ">
          <ul className=" h-full flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-2 ">
            {menuList?.map(({ groupLabel, menus }, index) => (
              <li key={index} className=" block w-full">
                {menus?.map(
                  ({ href, label, icon, active, id, submenus }, menuIndex) => (
                    <TooltipProvider disableHoverableContent key={menuIndex}>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          {submenus.length === 0 ? (
                            <Button
                              onClick={() =>
                                setConfig((prevConfig) => ({
                                  ...prevConfig,
                                  hasSubMenu: false,
                                  subMenu: true,
                                }))
                              }
                              asChild
                              size="icon"
                              color="secondary"
                              variant={active ? "default" : "ghost"}
                              className={cn(
                                "h-12 w-12 mx-auto mb-2 hover:ring-1 hover:ring-offset-0 hover:ring-default-200 dark:hover:ring-menu-arrow-active  hover:bg-default-100 dark:hover:bg-secondary   ",
                                {
                                  "bg-default-100 dark:bg-secondary  hover:bg-default-200/80 dark:hover:bg-menu-arrow-active ring-1 ring-default-200 dark:ring-menu-arrow-active":
                                    active,
                                }
                              )}
                            >
                              <Link href={href}>
                                <Icon
                                  icon={icon}
                                  className=" w-6 h-6 text-default-500 dark:text-secondary-foreground "
                                />
                              </Link>
                            </Button>
                          ) : (
                            <Button
                              onClick={() =>
                                setConfig((prevConfig) => ({
                                  ...prevConfig,
                                  hasSubMenu: true,
                                  subMenu: false,
                                }))
                              }
                              asChild
                              size="icon"
                              color="secondary"
                              variant={active ? "default" : "ghost"}
                              className={cn(
                                "h-12 w-12 mx-auto mb-2 hover:ring-1 hover:ring-offset-0 hover:ring-default-200 dark:hover:ring-menu-arrow-active  hover:bg-default-100 dark:hover:bg-secondary   ",
                                {
                                  "bg-default-100 dark:bg-secondary  hover:bg-default-200/80 dark:hover:bg-menu-arrow-active ring-1 ring-default-200 dark:ring-menu-arrow-active":
                                    active,
                                }
                              )}
                            >
                              <Link href={href}>
                                <Icon
                                  icon={icon}
                                  className=" w-6 h-6 text-default-500 dark:text-secondary-foreground "
                                />
                              </Link>
                            </Button>
                          )}
                        </TooltipTrigger>

                        <TooltipContent side="right">{label}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                )}
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
    </div>
  );
};

export default IconNav;
