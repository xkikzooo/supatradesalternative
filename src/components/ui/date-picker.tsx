"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/Calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}

export function DatePicker({ date, setDate, className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            "bg-gradient-to-b from-[#0A0A0A] to-[#111111]",
            "border-white/[0.05] shadow-[0_0_1px_rgba(0,0,0,0.5)]",
            "hover:bg-[#1A1A1A]/50 hover:border-white/[0.08]",
            "transition-all duration-200",
            !date && "text-gray-500",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
          {date ? (
            <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
              {format(date, "PPP", { locale: es })}
            </span>
          ) : (
            <span>Selecciona una fecha</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-auto p-0",
          "bg-gradient-to-b from-[#0A0A0A] to-[#111111]",
          "border border-white/[0.05] shadow-[0_0_1px_rgba(0,0,0,0.5)]",
          "backdrop-blur-xl rounded-xl"
        )} 
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={es}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
} 