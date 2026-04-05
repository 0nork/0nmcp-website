'use client'
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/hooks/use-config";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Icon } from "@/components/ui/icon";
import { motion } from 'framer-motion';


export function SidebarToggle() {
    const [config, setConfig] = useConfig()
    const collapsed = config.collapsed
    const isDesktop = useMediaQuery('(min-width: 1280px)')
    if (!isDesktop) return null
    if (config.sidebar === 'two-column' && !config.hasSubMenu || config.menuHidden || config.layout === "horizontal" || config.sidebar === 'classic') {
        return null
    }
    if (config.sidebar === 'two-column') {
        return (
            <Button
                onClick={() => setConfig((prevConfig) => ({ ...prevConfig, subMenu: !prevConfig.subMenu }))}
                className="rounded-md h-auto p-0 hover:bg-transparent hover:text-default-800 text-default-500 "
                variant="ghost"
                size="icon" >
                {config.subMenu ? (
                    <motion.div
                        key={config.subMenu ? 'collapsed' : 'expanded'}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <Icon icon="heroicons:arrow-small-right-solid" className="h-6 w-6" />
                    </motion.div>
                ) : (
                    <motion.div
                        key={config.subMenu ? 'collapsed' : 'expanded'}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <Icon icon="heroicons:bars-3-bottom-left-solid" className="h-6 w-6" />
                    </motion.div>
                )}
            </Button>

        )
    }
    return (

        <Button
            onClick={() => setConfig({ ...config, collapsed: !collapsed })}
            className="rounded-md h-auto p-0 hover:bg-transparent hover:text-default-800 text-default-500 "
            variant="ghost"
            size="icon"
        >
            {collapsed ? (
                <motion.div
                    key={collapsed ? 'collapsed' : 'expanded'}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <Icon icon="heroicons:arrow-small-right-solid" className="h-6 w-6" />
                </motion.div>
            ) : (
                <motion.div
                    key={collapsed ? 'collapsed' : 'expanded'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <Icon icon="heroicons:bars-3-bottom-left-solid" className="h-6 w-6" />
                </motion.div>
            )}
        </Button>

    );
}