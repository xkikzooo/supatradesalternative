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
import { ConfirmDeleteModal } from './confirm-delete-modal';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await onDelete(id);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error al eliminar:", error);
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
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
            WIN
          </span>
        );
      case 'LOSS':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-sm">
            LOSS
          </span>
        );
      case 'BE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
            BE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectionMode && (
              <Checkbox 
                checked={isSelected} 
                onCheckedChange={(checked: boolean | 'indeterminate') => {
                  onSelectChange?.(id, checked === true);
                }}
                onClick={(e) => e.stopPropagation()}
                className="mr-2 bg-white/10 border-white/20 data-[state=checked]:bg-blue-500/80 data-[state=checked]:border-blue-500/80"
              />
            )}
            <span className="text-sm text-white/60">
              {format(new Date(date), 'dd/MM/yyyy', { locale: es })}
            </span>
          </div>
          {selectionMode && isSelected && (
            <span className="text-sm text-blue-300 font-medium">Seleccionado</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-semibold text-white">{tradingPair.name}</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm",
                direction === "LONG" 
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              )}>
                {direction}
              </span>
              {account && (
                <span className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm",
                  account.type === "Real" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                )}>
                  {account.type}
                </span>
              )}
              {account && <span className="text-xs text-white/60">{account.broker}</span>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <span className={cn(
                "text-xl font-bold",
                pnl > 0 ? "text-emerald-300" : "text-rose-300"
              )}>
                {formatPnL(pnl)}
              </span>
              {getResultTag(pnl > 0 ? 'WIN' : 'LOSS')}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-white/60" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white/60" />
                )}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-5 w-5 text-white/60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/trades/edit/${id}`);
                    }} 
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-rose-300 focus:text-rose-200 hover:bg-rose-500/20"
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
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-sm text-white/60 font-medium">Bias</p>
              <p className="text-white">{bias}</p>
            </div>
            {psychology && (
              <div>
                <p className="text-sm text-white/60 font-medium">Psicología</p>
                <p className="text-white">{psychology}</p>
              </div>
            )}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div 
                    key={index} 
                    className="relative aspect-square w-32 h-32 rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-white/20 transition-all duration-200"
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
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Trade"
        description={`¿Estás seguro de que quieres eliminar este trade de ${tradingPair.name}? Esta acción no se puede deshacer.`}
        type="danger"
        confirmText="Eliminar Trade"
        cancelText="Cancelar"
      />

      {/* Modal de imagen ampliada */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer p-2"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative w-full h-full max-w-7xl max-h-[95vh] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 bg-black/40 hover:bg-black/60 rounded-xl backdrop-blur-sm"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedImage}
                alt="Imagen ampliada"
                width={1600}
                height={1200}
                className="w-full h-full object-contain"
                style={{ maxHeight: '95vh', maxWidth: '95vw' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
} 