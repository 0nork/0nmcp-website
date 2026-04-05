'use client'
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Link } from '@/i18n/routing';
import { Icon } from "@/components/ui/icon";
import { useConfig } from "@/hooks/use-config";
const HeaderSearch = () => {
    const [config] = useConfig();
    if (config.layout === 'horizontal') return null
    return (
        <Dialog>
            <DialogTrigger asChild>

                <button
                    type="button"
                    className="flex items-center xl:text-sm text-lg xl:text-default-400 text-default-800 dark:text-default-700 gap-3 cursor-pointer"

                >
                    <Icon icon="heroicons-outline:search" />
                    <span className="xl:inline-block hidden">Search... </span>
                </button>
            </DialogTrigger>
            <DialogContent className="p-0">
                <DialogTitle className="hidden"></DialogTitle>
                <DialogDescription className="hidden"></DialogDescription>
                <Command className=" bg-card">
                    <div className="flex items-center border-b border-default-200">
                        <CommandInput
                            placeholder=""
                            className="h-14 border-b-0"
                        />
                    </div>
                    <CommandList className="py-5 px-3 max-h-[500px]">
                        <CommandEmpty>No results found.</CommandEmpty>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <CommandGroup
                                heading="Populer Searches"
                                className="[&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-default-400 [&_[cmdk-group-heading]]:mb-2.5
                [&_[cmdk-group-heading]]:uppercase    [&_[cmdk-group-heading]]:tracking-widest
                "
                            >
                                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                                    <Link
                                        href="/calendar-page"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary ">
                                        <Icon icon="heroicons:calendar-days" />
                                        <span>Calendar</span>
                                    </Link>
                                </CommandItem>
                                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                                    <Link
                                        href="/dashboard"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary ">
                                        <Icon icon="heroicons:chart-bar" />
                                        <span>Analytics</span>
                                    </Link>
                                </CommandItem>
                                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                                    <Link
                                        href="/ecommerce"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary ">
                                        <Icon icon="heroicons:shopping-bag" />
                                        <span>eCommerce</span>
                                    </Link>
                                </CommandItem>
                                <CommandItem className="aria-selected:bg-transparent p-0 ">
                                    <Link
                                        href="/project"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary ">
                                        <Icon icon="heroicons:building-library" />
                                        <span>Project Page</span>
                                    </Link>
                                </CommandItem>
                            </CommandGroup>
                            <CommandGroup
                                heading="Apps & Pages"
                                className="[&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-default-400 [&_[cmdk-group-heading]]:mb-2.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest">
                                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                                    <Link
                                        href="/chat"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary">
                                        <Icon icon="heroicons:chat-bubble-bottom-center" />
                                        <span>Chat</span>
                                    </Link>
                                </CommandItem>
                                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                                    <Link
                                        href="/email"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary">
                                        <Icon icon="heroicons:envelope" />
                                        <span>Email</span>
                                    </Link>
                                </CommandItem>
                                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                                    <Link
                                        href="/dashboard"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary">
                                        <Icon icon="heroicons:user" />
                                        <span>Sign In</span>
                                    </Link>
                                </CommandItem>
                                <CommandItem className="aria-selected:bg-transparent p-0">
                                    <Link
                                        href="/calendar-page"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary">
                                        <Icon icon="heroicons:chart-bar" />
                                        <span>Appex Chart</span>
                                    </Link>
                                </CommandItem>
                            </CommandGroup>
                            <CommandGroup
                                heading="UI Elements"
                                className="[&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-default-400 [&_[cmdk-group-heading]]:mb-2.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest">
                                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                                    <Link
                                        href="/accordion"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary ">
                                        <Icon icon="heroicons:bars-3" />
                                        <span>Accordion</span>
                                    </Link>
                                </CommandItem>
                                <CommandItem className="aria-selected:bg-transparent p-0 mb-1">
                                    <Link
                                        href="/checkbox"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary " >
                                        <Icon icon="heroicons:check" />
                                        <span>Checkboxes</span>
                                    </Link>
                                </CommandItem>
                                <CommandItem className="aria-selected:bg-transparent p-0 mb-1">
                                    <Link
                                        href="/alert"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary " >
                                        <Icon icon="heroicons:megaphone" />
                                        <span>Alert</span>
                                    </Link>
                                </CommandItem>
                                <CommandItem className="aria-selected:bg-transparent p-0 mb-1">
                                    <Link
                                        href="/pagination"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary " >
                                        <Icon icon="heroicons:document-text" />
                                        <span>Pagination</span>
                                    </Link>
                                </CommandItem>
                            </CommandGroup>
                            <CommandGroup
                                heading="Forms & Tables"
                                className="[&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-default-400 [&_[cmdk-group-heading]]:mb-2.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest"
                            >
                                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                                    <Link
                                        href="/simple-table"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary ">
                                        <Icon icon="heroicons:table-cells" />
                                        <span>Simple Table</span>
                                    </Link>
                                </CommandItem>
                                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                                    <Link
                                        href="/tailwindui-table"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary ">
                                        <Icon icon="heroicons:table-cells" />
                                        <span>Tailwind Ui Table</span>
                                    </Link>
                                </CommandItem>
                                <CommandItem className="aria-selected:bg-transparent p-0 mb-2.5">
                                    <Link
                                        href="/data-table"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary ">
                                        <Icon icon="heroicons:table-cells" />
                                        <span>Tanstack Table</span>
                                    </Link>
                                </CommandItem>
                                <CommandItem className="aria-selected:bg-transparent p-0">
                                    <Link
                                        href="/calendar-page"
                                        className="flex gap-1 items-center px-2 text-default-500 hover:text-primary ">
                                        <Icon icon="heroicons:clipboard-document-list" />
                                        <span>Forms</span>
                                    </Link>
                                </CommandItem>
                            </CommandGroup>
                        </div>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
};

export default HeaderSearch;
