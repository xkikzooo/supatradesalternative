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
  // Establecer la fecha actual como valor por defecto si no hay fecha seleccionada
  const today = React.useMemo(() => new Date(), []);
  const handleDefaultSelection = React.useCallback(() => {
    if (!date) {
      setDate(today);
    }
  }, [date, setDate, today]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            "bg-gradient-to-b from-gray-900 to-gray-800",
            "border border-gray-700 shadow-sm",
            "hover:bg-gradient-to-b hover:from-gray-800 hover:to-gray-700",
            "hover:border-blue-500/50 hover:shadow-blue-500/20 hover:shadow-md",
            "transition-all duration-200",
            !date && "text-gray-500",
            className
          )}
          onClick={handleDefaultSelection}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-blue-400" />
          {date ? (
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-medium">
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
          "bg-gradient-to-b from-gray-900 to-gray-800",
          "border border-gray-700 shadow-md",
          "backdrop-blur-xl rounded-xl"
        )} 
        align="start"
      >
        <Calendar
          mode="single"
          selected={date || today}
          onSelect={setDate}
          locale={es}
          initialFocus
          defaultMonth={date || today}
        />
      </PopoverContent>
    </Popover>
  )
} 