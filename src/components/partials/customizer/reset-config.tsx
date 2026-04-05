'use client'
import React from 'react'
import { RefreshCcw } from 'lucide-react';
import { useConfig, defaultConfig } from '@/hooks/use-config';


const ResetConfig = () => {
    const [config, setConfig] = useConfig()
    return (
        <>
            <RefreshCcw
                onClick={() => {
                    setConfig({
                        ...defaultConfig
                    })
                }}

                className=" h-4 w-4 cursor-pointer text-default-600 hover:rotate-180 duration-150 me-4" />
        </>
    )
}

export default ResetConfig