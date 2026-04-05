'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Image from 'next/image';

export default function LocalSwitcher() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname();
    const localActive = useLocale();

    const onSelectChange = (nextLocale: string) => {
        startTransition(() => {

            router.replace(pathname, { locale: nextLocale });
        });
    };
    return (
        <Select onValueChange={onSelectChange} defaultValue={localActive}>
            <SelectTrigger className='w-[94px] border-none read-only:bg-transparent cursor-pointer'>
                <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent >
                <SelectItem
                    value="en"
                    className='border-none cursor-pointer'
                >
                    <div className='flex items-center gap-1'>
                        <Image
                            src="/images/all-img/flag-1.png"
                            alt='flag'
                            width={24}
                            height={24}
                            className='w-6 h-6 rounded-full'
                        />
                        <span className='font-medium text-sm text-default-600 dark:text-default-700'>En</span>
                    </div>
                </SelectItem>
                <SelectItem className='cursor-pointer' value="ar">
                    <div className='flex items-center gap-1'>
                        <Image
                            src="/images/all-img/flag-2.png"
                            alt='flag'
                            width={24}
                            height={24}
                            className='w-6 h-6 rounded-full'
                        />
                        <span className='font-medium text-sm text-default-600 dark:text-default-700'>Ar</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>

    );
}