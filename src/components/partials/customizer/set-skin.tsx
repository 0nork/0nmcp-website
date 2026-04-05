'use client'
import React from 'react'
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { useConfig } from '@/hooks/use-config'
import { Icon } from "@/components/ui/icon"
import {
  borderedSkinSvg,
  defaultSkinSvg,
} from "./data";
import { skinType } from '@/lib/type'

const allSkin: { key: skinType; label: string; }[] = [
  { key: "default", label: "Default" },
  { key: "bordered", label: "Bordered" },
];

const SetSkin = () => {
  const [config, setConfig] = useConfig()

  return (
    <div>
      <div className="text-sm font-medium mb-3">Skins</div>
      <div className="grid grid-cols-3 gap-3">
        {allSkin?.map(({ key, label }, index) => (
          <div key={key}>
            <button
              type="button"
              onClick={() => {
                if (key === "default") {
                  setConfig({ ...config, skin: key, layout: "vertical" });
                } else {
                  setConfig({ ...config, skin: key });
                }
              }}
              className={cn(
                " border  block  border-default-300  rounded relative h-[72px] w-full disabled:cursor-not-allowed duration-150 overflow-hidden cursor-pointer",
                {
                  "text-default  border-default-700 dark:border-default-600": config.skin === key,
                  "text-muted-foreground": config.skin !== key,
                }
              )}
            >
              <Icon
                icon="heroicons:check-circle-20-solid"
                className={cn(
                  "text-default absolute top-1 right-1 duration-100 scale-0",
                  {
                    " scale-100": config.skin === key,
                  }
                )}
              />

              {key === "default"
                ? defaultSkinSvg
                : key === "bordered"
                  ? borderedSkinSvg
                  : defaultSkinSvg}
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

export default SetSkin