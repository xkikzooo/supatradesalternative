'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SharedTrade {
  id: string;
  tradingPair: {
    id: string;
    name: string;
  };
  direction: 'LONG' | 'SHORT';
  bias?: string;
  biasExplanation?: string;
  psychology?: string;
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
  pnl: number;
  riskAmount?: number;
  images: string[];
  date: string;
  account: {
    name: string;
    broker: string;
    type: string;
  };
  trader: {
    name: string;
  };
  sharedAt: string;
}

export default function SharedTradePage() {
  const params = useParams();
  const token = params?.token as string;
  const [trade, setTrade] = useState<SharedTrade | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  useEffect(() => {
    const fetchSharedTrade = async () => {
      try {
        const response = await fetch(`/api/shared/trade/${token}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar el trade');
        }

        const tradeData = await response.json();
        setTrade(tradeData);
      } catch (error) {
        console.error('Error al cargar trade compartido:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar el trade');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchSharedTrade();
    }
  }, [token]);

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
      <TrendingUp className="h-5 w-5 text-green-500" />
    ) : (
      <TrendingDown className="h-5 w-5 text-red-500" />
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60 text-lg">Cargando trade compartido...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-red-300 mb-4">Error</h1>
            <p className="text-red-200 mb-6">{error}</p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-blue-500/80 hover:bg-blue-500 text-white"
            >
              Ir a Supatrades
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60 text-lg">Trade no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header simplificado */}
        <div className="mb-8 text-center">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-center gap-4">
              <Image
                src="/supatrades.svg"
                alt="Supatrades"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {trade.trader.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-white/80 font-medium">{trade.trader.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trade Details */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 space-y-8">
          
          {/* Resultado Principal */}
          <div className="text-center space-y-4">
            <div className={cn("text-4xl font-bold", getResultColor(trade.result))}>
              {formatPnL(trade.pnl)}
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className={cn(
                "w-4 h-4 rounded-full",
                trade.result === 'WIN' ? 'bg-emerald-400' : 
                trade.result === 'LOSS' ? 'bg-rose-400' : 'bg-amber-400'
              )} />
              <span className={cn("text-lg font-medium", getResultColor(trade.result))}>
                {getResultText(trade.result)}
              </span>
            </div>
          </div>

          {/* Información del Trade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-white/60">Par de Trading</div>
              <div className="text-xl font-semibold text-white">{trade.tradingPair.name}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-white/60">Dirección</div>
              <div className="flex items-center gap-2">
                {getDirectionIcon(trade.direction)}
                <span className="text-lg font-medium text-white">{trade.direction}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-white/60">Fecha</div>
              <div className="text-lg font-medium text-white">
                {format(new Date(trade.date), 'dd/MM/yyyy', { locale: es })}
              </div>
            </div>
          </div>

          {/* Imágenes - Movido aquí */}
          {trade.images && trade.images.length > 0 && (
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Evidencia Visual ({trade.images.length} {trade.images.length === 1 ? 'imagen' : 'imágenes'})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trade.images.map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-white/20 cursor-pointer hover:scale-105 transition-transform duration-200">
                    <Image
                      src={image}
                      alt={`Trade ${trade.tradingPair.name} - Imagen ${index + 1}`}
                      fill
                      className="object-cover"
                      onClick={() => {
                        setSelectedImage(image);
                        setIsImageZoomed(false);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Análisis */}
          {trade.bias && (
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Análisis</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-white/60">Bias</div>
                  <div className="text-white font-medium">{trade.bias}</div>
                </div>
                
                {trade.biasExplanation && (
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">Explicación del Análisis</div>
                    <div className="text-white/90 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                      {trade.biasExplanation}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información de la Cuenta - Movido al final */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Información de la Cuenta</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-white/60">Cuenta</div>
                <div className="text-white font-medium">{trade.account.name}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-white/60">Broker</div>
                <div className="text-white font-medium">{trade.account.broker}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-white/60">Tipo</div>
                <span className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm",
                  trade.account.type === "Real" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                )}>
                  {trade.account.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de imagen ampliada */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer p-2"
          onClick={() => setSelectedImage(null)}
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
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Contador de imágenes */}
            {trade.images.length > 1 && (
              <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm border border-white/20">
                {trade.images.findIndex(img => img === selectedImage) + 1} / {trade.images.length}
              </div>
            )}
            
            {/* Imagen principal */}
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

            {/* Flechas de navegación */}
            {trade.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = trade.images.findIndex(img => img === selectedImage);
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : trade.images.length - 1;
                    setSelectedImage(trade.images[prevIndex]);
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = trade.images.findIndex(img => img === selectedImage);
                    const nextIndex = currentIndex < trade.images.length - 1 ? currentIndex + 1 : 0;
                    setSelectedImage(trade.images[nextIndex]);
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 