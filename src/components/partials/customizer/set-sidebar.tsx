'use client'
import React from 'react'
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { useConfig } from '@/hooks/use-config'
import { Icon } from "@/components/ui/icon"
import { sidebarType } from '@/lib/type'
import {
  classicSidebarSvg,
  draggableSidebarSvg,
  twoColumnSidebarSvg,
  compactSidebarSvg,
} from "./data";

const allSidebars: { key: sidebarType, label: string, icon: string }[] = [
  { key: "classic", label: "Classic", icon: "heroicons:chart-bar" },
  { key: "draggable", label: "Draggable", icon: "heroicons:chart-pie" },
  { key: "two-column", label: "Two Column", icon: "heroicons:chart-pie" },
  { key: "compact", label: "Compact", icon: "heroicons:chart-pie" },
];


const SetSidebar = () => {
  const [config, setConfig] = useConfig()

  return (
    <div>
      <div className="text-sm font-medium mb-3">Sidebar</div>
      <div className="grid grid-cols-3 gap-3">
        {allSidebars?.map(({ key, label, icon }, index) => (
          <div key={key}>
            <button
              type="button"
              onClick={() => {
                if (key === "two-column") {
                  setConfig({ ...config, sidebar: key, layout: "vertical" });
                } else {
                  setConfig({ ...config, sidebar: key });
                }
              }}
              className={cn(
                " border  block  border-default-300 rounded relative h-[72px] w-full disabled:cursor-not-allowed duration-150 overflow-hidden cursor-pointer",
                {
                  "text-default  border-default-700 dark:border-default-600": config.sidebar === key,
                  "text-muted-foreground ": config.sidebar !== key,
                }
              )}
            >
              <Icon
                icon="heroicons:check-circle-20-solid"
                className={cn(
                  "text-default absolute top-1 right-1 duration-100 scale-0",
                  {
                    " scale-100": config.sidebar === key,
                  }
                )}
              />

              {key === "classic"
                ? classicSidebarSvg
                : key === "draggable"
                  ? draggableSidebarSvg
                  : key === "two-column"
                    ? twoColumnSidebarSvg
                    : key === "compact"
                      ? compactSidebarSvg
                      : classicSidebarSvg}
            </button>

            <Label className=" text-muted-foreground font-normal capitalize block mt-2.5">
              {label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SetSidebar