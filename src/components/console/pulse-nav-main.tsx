"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({ items }: { items: any[] }) {
  const pathname = usePathname()

  // ✅ active route check
  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + "/")
  }

  // ✅ check if parent should be open
  const isParentActive = (item: any): boolean => {
    if (!item.items) return false

    return item.items.some((sub: any) => {
      if (sub.items) {
        return sub.items.some((child: any) =>
          pathname.startsWith(child.url)
        )
      }
      return pathname.startsWith(sub.url)
    })
  }

  return (
    <SidebarMenu>
      {items.map((item: any) => {
        const parentActive = isParentActive(item)

        // ✅ control open state dynamically
        const [open, setOpen] = useState(parentActive)

        useEffect(() => {
          if (parentActive) setOpen(true)
        }, [pathname])

        return item.items ? (
          <Collapsible
            key={item.title}
            open={open}
            onOpenChange={setOpen}
          >
            <SidebarMenuItem>

              {/* Parent */}
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className="group"
                  isActive={parentActive}
                >
                  {item.icon}
                  <span>{item.title}</span>

                  <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarMenuSub>

                  {item.items.map((subItem: any) => {
                    const subActive = isActive(subItem.url)

                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        {subItem.items ? (
                          <Collapsible
                            defaultOpen={subItem.items.some((child: any) =>
                              pathname.startsWith(child.url)
                            )}
                          >
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton className="group">
                                {subItem.title}
                                <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]:rotate-90" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <SidebarMenuSub>

                                {subItem.items.map((child: any) => (
                                  <SidebarMenuButton
                                    key={child.title}
                                    asChild
                                    isActive={isActive(child.url)}
                                  >
                                    <Link href={child.url}>
                                      {child.title}
                                    </Link>
                                  </SidebarMenuButton>
                                ))}

                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <SidebarMenuButton
                            asChild
                            isActive={subActive}
                          >
                            <Link href={subItem.url}>
                              {subItem.title}
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuSubItem>
                    )
                  })}

                </SidebarMenuSub>
              </CollapsibleContent>

            </SidebarMenuItem>
          </Collapsible>
        ) : (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={isActive(item.url)}
            >
              <Link href={item.url}>
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}