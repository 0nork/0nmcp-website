'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import { Button } from "@/components/ui/button"
interface navProps {
  dotStyle?: boolean
  links: {
    title: string
    href?: string
    active: boolean
    label?: string
    icon?: any
  }[]
}
const Nav = ({ links, dotStyle = false }: navProps) => {
  if (dotStyle) {
    return (
      <nav className=' space-y-1 px-5'>
        {links.map(({ icon, title, active }, index) =>
          <Button
            key={`link-${index}`}
            fullWidth className='capitalize justify-start hover:bg-transparent hover:text-default-600'
            variant="ghost">
            <span
              className={cn(
                "h-2 w-2 me-2 rounded-full  transition-all duration-150 ring-0   bg-default ring-default ring-opacity-30",
                {
                  "ring-4 ring-default/30 bg-default": active,
                  "bg-destructive ring-destructive": title === 'team' || title==="promotions",
                  "bg-success ring-success": title === 'low' || title==="social",
                  "bg-warning ring-warning": title === 'medium',
                  "bg-primary ring-primary": title === 'high' || title==="buisness",
                  "bg-info ring-info/30": title === 'update',
                }
              )}
            ></span>
            {title}
          </Button>
        )}
      </nav>
    )
  }
  return (
    <nav className=' space-y-1 px-5'>

      {links.map(({ icon, title, active }, index) =>
        <Button key={`link-${index}`} color='secondary' fullWidth className='hover:ring-0 hover:ring-transparent justify-start' variant={active ? 'default' : 'ghost'}>
          <Icon
            icon={icon}
            className='me-2 h-5 w-5'
          />

          {title}
        </Button>
      )}
    </nav>
  )
}

export default Nav
