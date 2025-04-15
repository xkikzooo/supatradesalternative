"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, MoreVertical, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface TradeCardProps {
  id: string
  tradingPair: string
  date: Date
  pnl: number
  bias: string
  psychology: string
  images: string[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function TradeCard({ 
  id,
  tradingPair, 
  date, 
  pnl, 
  bias, 
  psychology, 
  images,
  onEdit,
  onDelete
}: TradeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-card rounded-lg shadow-sm border">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">{tradingPair}</h3>
            <span className="text-sm text-muted-foreground">
              {format(date, "d 'de' MMMM, yyyy", { locale: es })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
              {pnl >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="font-medium">{pnl}%</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <MoreVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(id)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Eliminar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="focus:outline-none"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="font-medium mb-1">Sesgo</h4>
              <p className="text-sm text-muted-foreground">{bias}</p>
            </div>

            <div>
              <h4 className="font-medium mb-1">Psicología</h4>
              <p className="text-sm text-muted-foreground">{psychology}</p>
            </div>

            {images.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Imágenes</h4>
                <div className="grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-[16/9]">
                      <Image
                        src={image}
                        alt={`Trade ${tradingPair} imagen ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 