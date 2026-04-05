'use client'
import React from "react";
import { ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/components/navigation";
import { useConfig } from '@/hooks/use-config'
import { useTranslations } from 'next-intl';
import { getHorizontalMenuList } from "@/lib/menus";
import { Icon } from "@/components/ui/icon";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useMediaQuery } from "@/hooks/use-media-query";

export default function HorizontalMenu() {

  const [config] = useConfig()

  const t = useTranslations("Menu");
  const pathname = usePathname();

  const menuList = getHorizontalMenuList(pathname, t)

  const [openDropdown, setOpenDropdown] = React.useState<boolean>(false);

  const isDesktop = useMediaQuery('(min-width: 1280px)')

  if (config.layout !== 'horizontal' || !isDesktop) return null
  return (
    <div>
      <Menubar className=" py-2.5 h-auto flex-wrap bg-card">
        {menuList?.map(({ menus }, index) => (
          <React.Fragment key={index}>
            {menus.map(({ href, label, icon, submenus }, index) =>
              submenus.length === 0 ? (
                <MenubarMenu key={index}>
                  <MenubarTrigger asChild>
                    <Link href={href} className=" cursor-pointer">
                      <Icon icon={icon} className=" h-5 w-5 me-2" />
                      {label}
                    </Link>
                  </MenubarTrigger>
                </MenubarMenu>
              ) : (
                <MenubarMenu key={index}>
                  <MenubarTrigger className=" cursor-pointer items-center">
                    <Icon icon={icon} fontSize={18} className=" me-1.5 leading-1" />
                    <span>{label}

                    </span>
                    <ChevronDown className="ms-1 h-4 w-4" />
                  </MenubarTrigger>
                  <MenubarContent >
                    {submenus.map(
                      ({ href, label, icon, children: subChildren }, index) =>
                        subChildren?.length === 0 ? (
                          <MenubarItem key={`sub-index-${index}`} className=" cursor-pointer" asChild>
                            <Link href={href}>
                              <Icon icon={icon} fontSize={16} className=" me-1.5" />
                              {label}
                            </Link>
                          </MenubarItem>
                        ) : (
                          <React.Fragment key={`sub-in-${index}`}>

                            <MenubarSub   >
                              <MenubarSubTrigger>
                                <Link
                                  href={href}
                                  className="flex cursor-pointer"
                                >
                                  {icon && (
                                    <Icon
                                      icon={icon}
                                      fontSize={18}
                                      className=" me-1.5"
                                    />
                                  )}
                                  {label}
                                </Link>
                              </MenubarSubTrigger>
                              <MenubarSubContent >
                                {subChildren?.map(
                                  ({ href, label }, index) => (
                                    <MenubarItem key={index}>
                                      <Link
                                        href={href}
                                        className="flex cursor-pointer"
                                      >


                                        {label}
                                      </Link>
                                    </MenubarItem>
                                  )
                                )}
                              </MenubarSubContent>
                            </MenubarSub>
                          </React.Fragment>
                        )
                    )}
                  </MenubarContent>
                </MenubarMenu>
              )
            )}
          </React.Fragment>
        ))}
      </Menubar>
    </div>
  );
}


