'use client'
import { cn } from "@/lib/utils"
import { useConfig } from '@/hooks/use-config'
import React from 'react'

const MenuLabel = ({ label, className }: { label: string, className?: string }) => {
    const [config] = useConfig()
    if (config.sidebar === 'compact') return null
    return (
        <p className={cn('text-xs font-semibold text-default-800  py-4 max-w-[248px] truncate uppercase', className)}>
            {label}
        </p>
    )
}

export default MenuLabel