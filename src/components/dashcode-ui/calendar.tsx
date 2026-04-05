"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0 border-default-200 dark:border-default-300 md:p-3", className)}
      classNames={{
        months: "w-full  space-y-4 sm:gap-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center py-1 relative items-center",
        caption_label: "text-base font-medium",
        nav: "gap-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute start-2",
        nav_button_next: "absolute end-2",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "flex-1 text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full gap-1 mt-2",
        cell: "flex-1 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-default [&:has([aria-selected])]:rounded-md focus-within:relative focus-within:z-20",
        day: "w-full h-9 rounded  p-0 font-normal aria-selected:opacity-100 bg-transparent text-current hover:text-default",
        day_selected:
          "bg-default text-default-foreground hover:bg-default hover:text-default-foreground focus:bg-default focus:text-default-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 cursor-pointer" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 cursor-pointer" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
