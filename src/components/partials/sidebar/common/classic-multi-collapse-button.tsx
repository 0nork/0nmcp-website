"use client";
import React from 'react'
import { Link, usePathname } from "@/components/navigation";
import { useState } from "react";
import { ChevronDown} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible";

import { SubChildren } from '@/lib/menus';
import { useMobileMenuConfig } from '@/hooks/use-mobile-menu';

interface CollapseMenuButtonProps {
    icon?: string;
    label: string;
    active: boolean;
    submenus: SubChildren[]
}

export function MultiCollapseMenuButton({
    label,
    active,
    submenus,

}: CollapseMenuButtonProps) {
    const pathname = usePathname();
    const isSubmenuActive = submenus.some((submenu) => submenu.active || pathname.startsWith(submenu.href));
    const [isCollapsed, setIsCollapsed] = useState<boolean>(isSubmenuActive);
    const [mobileMenuConfig, setMobileMenuConfig] = useMobileMenuConfig();
    return (

        <Collapsible
            open={isCollapsed}
            onOpenChange={setIsCollapsed}
            className="w-full mb-2 last:mb-0 "
        >
            <CollapsibleTrigger
                asChild
            >
                <div className=' flex items-center group [&[data-state=open]>button>div>div>svg]:rotate-180 first:mt-3 ' >

                    <Button
                        color='secondary'
                        variant="ghost"
                        className="w-full justify-start h-auto hover:bg-transparent hover:ring-offset-0 capitalize text-sm font-normal   md:px-5 px-5 "
                        fullWidth
                    >
                        <div className="w-full items-center flex justify-between">
                            <div className="flex items-center">
                                <span
                                    className={cn(
                                        "h-1.5 w-1.5 me-3 rounded-full  transition-all duration-150 ring-1 ring-secondary-foreground",
                                        {
                                            "ring-4 bg-default ring-default/30": active,

                                        }
                                    )}
                                ></span>
                                <p
                                    className={cn(
                                        "max-w-[150px] truncate",
                                    )}
                                >
                                    {label}
                                </p>
                            </div>
                            <div
                                className={cn(
                                    "whitespace-nowrap inline-flex items-center justify-center rounded-full h-5 w-5 bg-menu-arrow text-menu-menu-foreground  group-hover:bg-menu-arrow-active transition-all duration-300 ",
                                    {
                                        'bg-menu-arrow-active': active
                                    }
                                )}
                            >
                                <ChevronDown
                                    size={16}
                                    className="transition-transform duration-200"
                                />
                            </div>
                        </div>
                    </Button>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                {submenus.map(({ href, label, active }, index) => (


                    <Button
                        key={index}
                        onClick={() => setMobileMenuConfig({ ...mobileMenuConfig, isOpen: false })}
                        color='secondary'
                        variant="ghost"
                        className="w-full justify-start  h-auto mb-1.5  hover:bg-transparent first:mt-3 text-[13px]  font-normal "
                        asChild
                    >
                        <Link href={href}>
                            <span
                                className={cn(
                                    "h-1 w-1 me-3 rounded-full bg-default transition-all duration-150  ",
                                    {
                                        "ring-4 bg-secondary ring-default/30": active,

                                    }
                                )}
                            ></span>
                            <p
                                className={cn(
                                    "max-w-[170px] truncate",
                                )}
                            >
                                {label}
                            </p>
                        </Link>
                    </Button>

                ))}
            </CollapsibleContent>
        </Collapsible>

    )
}
