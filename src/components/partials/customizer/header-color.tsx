"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useConfig } from "@/hooks/use-config";
import { Icon } from "@/components/ui/icon";
import { Check } from "lucide-react";
import {
  lightTopbarColorSvg,
  colorTopbarColorSvg,
  borderedSkinSvg,
} from "./data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const HeaderColor = () => {
  const [config, setConfig] = useConfig();
  const [show, setShow] = React.useState<boolean>(
    config.headerColor !== "light" && config.headerColor === "transparent"
  );

  return (
    <div className="p-6 -mx-6">
      <div className="text-sm font-medium mb-3">Topbar Color</div>
      <div className=" grid grid-cols-3 gap-3 mb-4">
        <div>
          <button
            type="button"
            onClick={() => {
              setConfig({ ...config, headerColor: "light" });
              setShow(false);
            }}
            disabled={config.headerColor === "light"}
            className={cn(
              " border  block  border-default-300 rounded relative h-[72px] w-full disabled:cursor-not-allowed duration-150 overflow-hidden cursor-pointer",
              {
                "text-default  border-default-700 dark:border-default-600":
                  config.headerColor === "light",
                "text-muted-foreground ": config.headerColor !== "light",
              }
            )}
          >
            <Icon
              icon="heroicons:check-circle-20-solid"
              className={cn(
                "text-default absolute top-1 right-1 duration-100 scale-0",
                {
                  " scale-100": config.headerColor === "light",
                }
              )}
            />
            {lightTopbarColorSvg}
          </button>
          <Label className=" text-muted-foreground font-normal block mt-2.5 capitalize">
            Default
          </Label>
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              setShow(true);
              setConfig({ ...config, headerColor: "dark" });
            }}
            disabled={show}
            className={cn(
              "border  block  border-default-300 rounded relative h-[72px] w-full disabled:cursor-not-allowed duration-150 overflow-hidden cursor-pointer",
              {
                "text-default  border-default": show,
                "text-muted-foreground ": !show,
              }
            )}
          >
            <Icon
              icon="heroicons:check-circle-20-solid"
              className={cn(
                "text-default absolute top-1 right-1 duration-100 scale-0",
                {
                  " scale-100": show,
                }
              )}
            />
            {colorTopbarColorSvg}
          </button>
          <Label className=" text-muted-foreground font-normal block mt-2.5 capitalize">
            color
          </Label>
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              setConfig({ ...config, headerColor: "transparent" });
              setShow(false);
            }}
            disabled={config.headerColor === "transparent"}
            className={cn(
              " border  block  border-default-300 rounded relative h-[72px] w-full disabled:cursor-not-allowed duration-150 overflow-hidden cursor-pointer",
              {
                "text-default  border-default":
                  config.headerColor === "transparent",
                "text-muted-foreground ": config.headerColor !== "transparent",
              }
            )}
          >
            <Icon
              icon="heroicons:check-circle-20-solid"
              className={cn(
                "text-default absolute top-1 right-1 duration-100 scale-0",
                {
                  " scale-100": config.headerColor === "transparent",
                }
              )}
            />
            {borderedSkinSvg}
          </button>
          <Label className=" text-muted-foreground font-normal block mt-2.5 capitalize">
            transparent
          </Label>
        </div>
      </div>

      {show && (
        <div className="flex gap-1 flex-wrap bg-default-200 p-3 rounded-md">
          {[
            "dark",
            "rose",
            "steel-blue",
            "purple",
            "redwood",
            "green",
            "ocean-blue",
            "gray",
          ].map((color) => (
            <div key={color}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({ ...config, headerColor: color })
                      }
                      disabled={config.headerColor === color}
                      className={cn(
                        " border    border-default-300  inline-flex justify-center rounded-md items-center relative h-8 w-8  disabled:cursor-not-allowed duration-150 cursor-pointer",
                        {
                          "bg-default": color === "dark",
                          "bg-[#343A40]": color === "gray",
                          "bg-[#B52755]": color === "rose",
                          "bg-[#405189]": color === "steel-blue",
                          "bg-[#4A154B]": color === "purple",
                          "bg-[#5D3942]": color === "redwood",
                          "bg-[#135846]": color === "green",
                          "bg-[#0766AD]": color === "ocean-blue",
                        }
                      )}
                    >
                      <Check
                        className={cn(
                          " text-white h-4 w-4  duration-100 scale-0",
                          {
                            " scale-100": config.headerColor === color,
                          }
                        )}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{color}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeaderColor;
