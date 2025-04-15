"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

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
      className={cn(
        "p-4 bg-gradient-to-b from-[#0A0A0A] to-[#111111] rounded-xl backdrop-blur-xl",
        "border border-white/[0.05] shadow-[0_0_1px_rgba(0,0,0,0.5)]",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between pt-1 relative items-center px-1 mb-2",
        caption_label: cn(
          "text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent",
          "tracking-wide uppercase"
        ),
        nav: "flex items-center space-x-1",
        nav_button: cn(
          "h-7 w-7 bg-[#1A1A1A]/50 rounded-md p-0 hover:bg-[#2A2A2A]/50",
          "text-gray-400 hover:text-gray-100 transition-all duration-200",
          "hover:scale-105 active:scale-95",
          "border border-white/[0.05] shadow-sm"
        ),
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: cn(
          "text-[11px] font-medium text-gray-400 w-9 m-0.5",
          "tracking-wider uppercase"
        ),
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          "[&:has([aria-selected])]:bg-gradient-to-b [&:has([aria-selected])]:from-[#1A1A1A] [&:has([aria-selected])]:to-[#2A2A2A]"
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal text-sm rounded-md transition-all duration-200",
          "hover:bg-[#1A1A1A]/50 hover:text-gray-100",
          "focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] focus:ring-offset-2 focus:ring-offset-[#0A0A0A]",
          "aria-selected:bg-gradient-to-b aria-selected:from-[#2A2A2A] aria-selected:to-[#3A3A3A]",
          "hover:scale-110 active:scale-95"
        ),
        day_selected: cn(
          "bg-gradient-to-b from-[#2A2A2A] to-[#3A3A3A] text-gray-100",
          "hover:from-[#3A3A3A] hover:to-[#4A4A4A]",
          "shadow-lg shadow-black/10"
        ),
        day_today: cn(
          "text-gray-100 font-medium",
          "ring-2 ring-[#3A3A3A] ring-offset-1 ring-offset-[#0A0A0A]"
        ),
        day_outside: cn(
          "text-gray-600 opacity-50",
          "hover:bg-[#1A1A1A]/30 hover:text-gray-500"
        ),
        day_disabled: "text-gray-600 opacity-50 hover:bg-transparent",
        day_range_middle: "aria-selected:bg-[#1A1A1A] aria-selected:text-gray-100",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar } 