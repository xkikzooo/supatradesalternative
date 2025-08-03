'use client';

import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, TrendingUp, TrendingDown, X, AlertTriangle, AlertOctagon, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showToast } from "@/lib/toast";
import { cn } from '@/lib/utils';
import { Checkbox } from "@/components/ui/checkbox";

interface TradeGalleryCardProps {
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
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
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

export function TradeGalleryCard({
  id,
  tradingPair,
  date,
  pnl,
  bias,
  psychology,
  images,
  direction,
  result,
  account,
  onEdit,
  onDelete,
  isSelected = false,
  onSelectChange,
  selectionMode = false
}: TradeGalleryCardProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isImageZoomed) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isImageZoomed) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isImageZoomed) {
      e.preventDefault();
      setImagePosition(prev => ({
        x: prev.x - e.deltaX * 0.5,
        y: prev.y - e.deltaY * 0.5
      }));
    }
  };

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

  const getResultColor = (result: string) => {
    switch (result.toUpperCase()) {
      case 'WIN':
        return 'text-emerald-300';
      case 'LOSS':
        return 'text-rose-300';
      case 'BREAKEVEN':
        return 'text-amber-300';
      default:
        return 'text-white/60';
    }
  };

  const getResultText = (result: string) => {
    switch (result.toUpperCase()) {
      case 'WIN':
        return 'Profit';
      case 'LOSS':
        return 'Loss';
      case 'BREAKEVEN':
        return 'Breakeven';
      default:
        return 'Unknown';
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'LONG' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  // Generar un gráfico simulado para la vista de galería
  const generateMockChart = () => {
    return (
      <div className="relative w-full h-32 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-t-2xl overflow-hidden border-b border-white/10">
        {/* Línea de precio simulada */}
        <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={direction === 'LONG' ? '#10b981' : '#f43f5e'} stopOpacity="0.8" />
              <stop offset="100%" stopColor={direction === 'LONG' ? '#34d399' : '#fb7185'} stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path
            d="M0,50 Q25,30 50,40 T100,20 T150,60 T200,40"
            stroke="url(#chartGradient)"
            strokeWidth="2.5"
            fill="none"
            filter="drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))"
          />
          {/* Zona de stop loss (roja) */}
          <rect x="0" y="0" width="200" height="30" fill="rgba(244, 63, 94, 0.15)" />
          {/* Zona de take profit (verde) */}
          <rect x="0" y="70" width="200" height="30" fill="rgba(16, 185, 129, 0.15)" />
          {/* Línea de entrada */}
          <line x1="0" y1="50" x2="200" y2="50" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" strokeDasharray="5,5" />
        </svg>
      </div>
    );
  };

  // Renderizar imagen del trade o gráfico simulado
  const renderTradeImage = () => {
    if (images && images.length > 0) {
      return (
        <div className="relative w-full h-32 rounded-t-2xl overflow-hidden border-b border-white/10">
          <Image
            src={images[0]}
            alt={`Trade ${tradingPair.name}`}
            fill
            className="object-cover"
            onClick={() => {
              setSelectedImage(images[0]);
              setIsSummaryModalOpen(false);
            }}
          />
          {/* Overlay con información */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="text-white text-xs font-medium bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              Click para ampliar
            </div>
          </div>
          
          {/* Indicador de múltiples imágenes */}
          {images.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/20">
              <span className="text-white text-xs font-medium">+{images.length - 1}</span>
            </div>
          )}
        </div>
      );
    }
    
    return generateMockChart();
  };

  return (
    <>
      <div 
        className={cn(
          "relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:scale-[1.02] cursor-pointer shadow-xl hover:shadow-2xl",
          selectionMode && isSelected && "ring-2 ring-blue-400/50 ring-offset-2 ring-offset-black/50"
        )}
        onClick={() => setIsSummaryModalOpen(true)}
      >
        {/* Checkbox para selección */}
        {selectionMode && (
          <div className="absolute top-3 left-3 z-10">
            <Checkbox 
              checked={isSelected} 
              onCheckedChange={(checked: boolean | 'indeterminate') => {
                onSelectChange?.(id, checked === true);
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 border-white/20 data-[state=checked]:bg-blue-500/80 data-[state=checked]:border-blue-500/80"
            />
          </div>
        )}

        {/* Gráfico simulado */}
        {renderTradeImage()}

        {/* Información del trade */}
        <div className="p-5 space-y-4">
          {/* Par de trading */}
          <div className="space-y-1">
            <h3 className="font-semibold text-white/90 text-base">{tradingPair.name}</h3>
          </div>

          {/* PnL y resultado */}
          <div className="space-y-2">
            <div className={cn("text-xl font-bold", getResultColor(result))}>
              {formatPnL(pnl)}
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                result === 'WIN' ? 'bg-emerald-400' : 
                result === 'LOSS' ? 'bg-rose-400' : 'bg-amber-400'
              )} />
              <span className={cn("text-sm font-medium", getResultColor(result))}>
                {getResultText(result)}
              </span>
            </div>
          </div>

          {/* Fecha */}
          <div className="text-sm text-white/60">
            {format(new Date(date), 'dd/MM/yyyy', { locale: es })}
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
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
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm">
                  {account.type}
                </span>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4 text-white/60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px] bg-white/10 backdrop-blur-xl border border-white/20">
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
                  className="text-red-300 focus:text-red-200 hover:bg-red-500/20"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Eliminar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Modal de resumen del trade */}
      <Dialog open={isSummaryModalOpen} onOpenChange={setIsSummaryModalOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-xl text-white border border-white/20 shadow-2xl rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Resumen del Trade
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Fotos */}
            {images && images.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Fotos</h3>
                <div className="grid grid-cols-2 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-white/20">
                      <Image
                        src={image}
                        alt={`Trade ${tradingPair.name} - Imagen ${index + 1}`}
                        fill
                        className="object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={() => {
                          setSelectedImage(image);
                          setIsSummaryModalOpen(false);
                          setIsImageZoomed(false);
                          setImagePosition({ x: 0, y: 0 });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resultado */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Resultado</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className={cn("text-2xl font-bold", getResultColor(result))}>
                    {formatPnL(pnl)}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      result === 'WIN' ? 'bg-emerald-400' : 
                      result === 'LOSS' ? 'bg-rose-400' : 'bg-amber-400'
                    )} />
                    <span className={cn("text-sm font-medium", getResultColor(result))}>
                      {getResultText(result)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-white/60">Par de Trading</div>
                  <div className="text-lg font-semibold text-white">{tradingPair.name}</div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Información Adicional</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-white/60">Dirección</div>
                  <div className="flex items-center gap-2">
                    {getDirectionIcon(direction)}
                    <span className="text-white font-medium">{direction}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-white/60">Fecha</div>
                  <div className="text-white font-medium">
                    {format(new Date(date), 'dd/MM/yyyy', { locale: es })}
                  </div>
                </div>
                {account && (
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">Cuenta</div>
                    <div className="text-white font-medium">{account.name}</div>
                  </div>
                )}
                {bias && (
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">Bias</div>
                    <div className="text-white font-medium">{bias}</div>
                  </div>
                )}
              </div>
              
              {psychology && (
                <div className="space-y-2">
                  <div className="text-sm text-white/60">Psicología</div>
                  <div className="text-white">{psychology}</div>
                </div>
              )}
            </div>

            {/* Botón de editar */}
            <div className="flex justify-end pt-4 border-t border-white/10">
              <Button
                onClick={() => {
                  setIsSummaryModalOpen(false);
                  router.push(`/trades/edit/${id}`);
                }}
                className="bg-blue-500/80 hover:bg-blue-500 text-white flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar Trade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer p-2"
          onClick={() => {
            setSelectedImage(null);
            setIsSummaryModalOpen(true);
          }}
        >
          <div 
            className="relative w-full h-full max-w-7xl max-h-[95vh] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cerrar */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 bg-black/40 hover:bg-black/60 rounded-xl backdrop-blur-sm"
              onClick={() => {
                setSelectedImage(null);
                setIsSummaryModalOpen(true);
              }}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Contador de imágenes */}
            {images.length > 1 && (
              <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm border border-white/20">
                {images.findIndex(img => img === selectedImage) + 1} / {images.length}
              </div>
            )}
            
            {/* Imagen principal */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedImage}
                alt="Imagen ampliada"
                width={1600}
                height={1200}
                className={cn(
                  "w-full h-full object-contain cursor-pointer transition-transform duration-300",
                  isImageZoomed ? "scale-150" : "scale-100",
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                )}
                style={{ 
                  maxHeight: '95vh', 
                  maxWidth: '95vw',
                  transform: isImageZoomed ? `scale(1.5) translate(${imagePosition.x}px, ${imagePosition.y}px)` : 'scale(1) translate(0px, 0px)'
                }}
                onClick={(e) => {
                  if (!isDragging) {
                    e.stopPropagation();
                    setIsImageZoomed(!isImageZoomed);
                    if (!isImageZoomed) {
                      setImagePosition({ x: 0, y: 0 });
                    }
                  }
                }}
              />
            </div>

            {/* Flechas de navegación */}
            {images.length > 1 && (
              <>
                {/* Flecha izquierda */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = images.findIndex(img => img === selectedImage);
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
                    setSelectedImage(images[prevIndex]);
                    setIsImageZoomed(false);
                    setImagePosition({ x: 0, y: 0 });
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                {/* Flecha derecha */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = images.findIndex(img => img === selectedImage);
                    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
                    setSelectedImage(images[nextIndex]);
                    setIsImageZoomed(false);
                    setImagePosition({ x: 0, y: 0 });
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Indicadores de navegación (puntos) */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(image);
                      setIsImageZoomed(false);
                      setImagePosition({ x: 0, y: 0 });
                    }}
                    className={cn(
                      "w-3 h-3 rounded-full transition-colors backdrop-blur-sm",
                      selectedImage === image 
                        ? "bg-white shadow-lg" 
                        : "bg-white/50 hover:bg-white/75"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 