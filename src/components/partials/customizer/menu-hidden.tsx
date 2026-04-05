'use client'
import React from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { useConfig } from '@/hooks/use-config'

const MenuHidden = () => {
  const [config, setConfig] = useConfig()

  if (config.layout === 'horizontal') return null

  return (
    <div className="flex items-center gap-2">
      <Checkbox

        checked={config.menuHidden}
        id="menuHidden"
        onCheckedChange={() =>
          setConfig({ ...config, menuHidden: !config.menuHidden })
        }

      />
      <label
        htmlFor="menuHidden"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      >
        MenuHidden
      </label>
    </div>
  );
}

export default MenuHidden