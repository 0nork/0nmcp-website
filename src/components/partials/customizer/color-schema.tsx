"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { hexToRGB } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon"

import { Check } from "lucide-react";

const allThemes = [
    { key: "light", label: "Light", icon: "heroicons:sun" },
    { key: "dark", label: "Dark", icon: "heroicons:moon" },
    { key: "system", label: "System", icon: "heroicons:window" },

];

const ColorSchema = () => {
    const { theme, setTheme, resolvedTheme: mode } = useTheme();

    return (
        <div>
            <div className="mb-3 relative inline-block rounded-md before:bg-(--theme-primary) before:absolute before:top-0 before:left-0 before:w-full  before:h-full before:rounded before:opacity-10 before:z-[-1]  text-(--theme-primary)  text-sm font-medium">
                Color Scheme
            </div>

            <div className=" grid grid-cols-3 gap-3">
                {allThemes?.map((themeOption) => (
                    <div key={themeOption.key} className="flex-1 w-full">
                        <button
                            onClick={() => setTheme(themeOption.key as any)}
                            className={cn(
                                "border  flex border-default-300 w-full text-center items-center justify-center py-[14px]  px-10 rounded relative cursor-pointer",
                                {
                                    "text-default border-default-700 dark:border-default-600":
                                        theme === themeOption.key,
                                    "text-default-400 dark:text-default-600": theme !== themeOption.key,
                                }
                            )}
                        >
                            {theme === themeOption.key && (
                                <Icon
                                    icon="heroicons:check-circle-20-solid"
                                    className=" text-(--theme-primary) absolute top-1 right-1"
                                />
                            )}
                            <div>
                                <Icon icon={themeOption.icon} className=" h-5 w-5" />
                            </div>
                        </button>
                        <Label className=" text-muted-foreground font-normal block mt-2.5">
                            {themeOption.label}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ColorSchema;
