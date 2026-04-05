'use client'
import React from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { useConfig } from '@/hooks/use-config'

const SearchBarToggle = () => {
    const [config, setConfig] = useConfig()
    if (config.menuHidden || config.layout === 'horizontal') return null
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          checked={config.showSearchBar}
          id="searchBarToggle"
          onCheckedChange={() =>
            setConfig({ ...config, showSearchBar: !config.showSearchBar })
          } />
          <label
            htmlFor="searchBarToggle"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer" >
            Show Search Bar
          </label>
      </div>
    );
}

export default SearchBarToggle