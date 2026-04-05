'use client'
import React from 'react'
import { DirectionProvider as RadixDirProvider } from '@radix-ui/react-direction';
import { useConfig } from '@/hooks/use-config';

const DirectionProvider = ({ direction, children }: { direction: any, children: React.ReactNode }) => {
    const [, setConfig] = useConfig();

    React.useEffect(() => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            isRtl: direction === 'rtl',
        }));

    }, [direction, setConfig]);

    return (
        <RadixDirProvider dir={direction}>
            {children}</RadixDirProvider>
    )
}

export default DirectionProvider
