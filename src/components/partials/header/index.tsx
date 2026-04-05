import React from 'react'
import HeaderContent from './header-content'
import HeaderSearch from './header-search'
import ProfileInfo from './profile-info'
import Notifications from './notifications'
import Messages from "./messages"
import { Cart } from './cart'
import ThemeSwitcher from './theme-switcher'
import { SidebarToggle } from '@/components/partials/sidebar/sidebar-toggle'
import { SheetMenu } from '@/components/partials/sidebar/menu/sheet-menu'
import HorizontalMenu from "./horizontal-menu"
import LocalSwitcher from './locale-switcher'
import HeaderLogo from "./header-logo"


const 0nMCPHeader = async () => {
    return (
        <>
            <HeaderContent>
                <div className=' flex gap-3 items-center'>
                    <HeaderLogo />
                    <SidebarToggle />
                    <HeaderSearch />
                </div>
                <div className="nav-tools flex items-center  md:gap-4 gap-3">
                    <LocalSwitcher />
                    <ThemeSwitcher />
                    <Cart />
                    <Messages />
                    <Notifications />
                    <ProfileInfo />
                    <SheetMenu />
                </div>
            </HeaderContent>
            <HorizontalMenu />
        </>
    )
}

export default 0nMCPHeader