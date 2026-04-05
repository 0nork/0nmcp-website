"use client";

import React from 'react'
import { usePathname } from "@/components/navigation";
import { getMenuList, type Group, type Menu, type Submenu } from "@/lib/menus";

import IconNav from './icon-nav';
import SidebarNav from './sideabr-nav';
import { useTranslations } from 'next-intl';


export function MenuTwoColumn() {
    // translate
    const t = useTranslations("Menu")
    const pathname = usePathname();
    const menuList = getMenuList(pathname, t);

    return (
        <>
            <IconNav menuList={menuList} />
            <SidebarNav menuList={menuList} />
        </>


    );
}
