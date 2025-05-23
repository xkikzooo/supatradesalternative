'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, MoreVertical, Pencil, Trash2, TrendingUp, TrendingDown, X, AlertTriangle, AlertOctagon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from './button';
// TradeModal eliminado - ahora se usa página completa
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { showToast } from "@/lib/toast";
import { cn } from '@/lib/utils';
import { Checkbox } from "@/components/ui/checkbox";

interface TradeCardProps {
  id: string;
  tradingPair: {
    id: string;
    name: string;
  };
  date: string;
  pnl: number;
  bias: string;
  psychology?: string;
  images: string[];
  direction: 'LONG' | 'SHORT';
  account?: {
    id: string;
    name: string;
    broker: string;
    type: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelectChange?: (id: string, isSelected: boolean) => void;
  selectionMode?: boolean;
}

export function TradeCard({
  id,
  tradingPair,
  date,
  pnl,
  bias,
  psychology,
  images,
  direction,
  account,
  onEdit,
  onDelete,
  isSelected = false,
  onSelectChange,
  selectionMode = false
}: TradeCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  // Estado del modal eliminado - ahora se usa página completa
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      // Cerrar el diálogo primero para evitar interacciones durante la eliminación
      setIsDeleteDialogOpen(false);
      
      // Pequeño retraso para permitir que la animación del diálogo termine
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Llamar a la función onDelete proporcionada por el componente padre
      // No mostramos toast aquí para evitar duplicación
      await onDelete(id);
      
      // No mostrar toast aquí, el componente padre ya se encarga de eso
    } catch (error) {
      console.error("Error al eliminar:", error);
      
      // En caso de error sí mostramos el toast aquí
      showToast(
        error instanceof Error ? error.message : "Error al eliminar el trade", 
        "error"
      );
    }
  };

  const formatPnL = (pnl: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(pnl);
  };

  const getResultTag = (result: string) => {
    switch (result.toUpperCase()) {
      case 'WIN':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-500">
            WIN
          </span>
        );
      case 'LOSS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500">
            LOSS
          </span>
        );
      case 'BE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500">
            BE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="rounded-lg border border-gray-800 bg-black/50 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectionMode && (
              <Checkbox 
                checked={isSelected} 
                onCheckedChange={(checked: boolean | 'indeterminate') => onSelectChange?.(id, checked === true)}
                className="mr-2"
              />
            )}
            <span className="text-xs text-gray-400">
              {format(new Date(date), 'dd/MM/yyyy', { locale: es })}
            </span>
          </div>
          {selectionMode && isSelected && (
            <span className="text-xs text-blue-400">Seleccionado</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-lg font-medium text-white">{tradingPair.name}</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-1.5 py-0.5 rounded text-xs font-medium",
                direction === "LONG" 
                  ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
              )}>
                {direction}
              </span>
              {account && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-xs font-medium",
                  account.type === "Real" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                )}>
                  {account.type}
                </span>
              )}
              {account && <span className="text-xs text-gray-400">{account.broker}</span>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <span className={cn(
                "text-lg font-medium",
                pnl > 0 ? "text-green-400" : "text-red-400"
              )}>
                {formatPnL(pnl)}
              </span>
              {getResultTag(pnl > 0 ? 'WIN' : 'LOSS')}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-800 rounded-md transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-gray-800 rounded-md transition-colors">
                    <MoreVertical className="h-5 w-5 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onClick={() => router.push(`/trades/edit/${id}`)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-800">
            <div>
              <p className="text-sm text-gray-400">Bias</p>
              <p className="text-white">{bias}</p>
            </div>
            {psychology && (
              <div>
                <p className="text-sm text-gray-400">Psicología</p>
                <p className="text-white">{psychology}</p>
              </div>
            )}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <div 
                    key={index} 
                    className="relative aspect-square w-16 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <Image
                      src={image}
                      alt={`Trade image ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 text-white border border-zinc-800 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-zinc-100">
              <AlertOctagon className="h-6 w-6 text-red-500 animate-pulse" />
              Confirmar eliminación
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              ¿Estás seguro de que quieres eliminar este trade de {tradingPair.name}?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 flex items-center gap-1">
              <X className="h-4 w-4" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-zinc-100 hover:bg-red-700 flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de edición eliminado - ahora se usa una página completa */}

      {/* Modal de imagen ampliada */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            <Image
              src={selectedImage}
              alt="Imagen ampliada"
              width={1200}
              height={800}
              className="rounded-lg"
              style={{ objectFit: 'contain', maxHeight: '90vh' }}
            />
          </div>
        </div>
      )}
    </>
  );
} 