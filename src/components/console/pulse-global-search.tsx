"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Search } from "lucide-react"

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-9 w-9"
        onClick={() => setOpen(true)}
      >
        <Search className="size-5"/>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Dashboard">
            <CommandItem onSelect={() => router.push("/")}>
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => router.push("/analytics")}>
              Analytics
            </CommandItem>
            <CommandItem onSelect={() => router.push("/crm")}>
              CRM
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => alert("Profile")}>
              Profile
            </CommandItem>
            <CommandItem onSelect={() => alert("Billing")}>
              Billing
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}