'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ImageDropzone } from './ImageDropzone';
import { TagSelector } from './tag-selector';
import { showToast } from '@/lib/toast';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { X, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: {
    id: string;
    tradingPair: {
      id: string;
      name: string;
    };
    direction: 'LONG' | 'SHORT';
    bias: string;
    biasExplanation?: string;
    psychology?: string;
    result: string;
    pnl: number;
    riskAmount?: number;
    images: string[];
    date?: string;
    accountId?: string;
  };
}

interface TradingPair {
  id: string;
  name: string;
}

interface TradeFormData {
  id?: string;
  tradingPair: {
    id: string;
    name: string;
  };
  direction: 'LONG' | 'SHORT';
  bias: string;
  biasExplanation: string;
  psychology?: string;
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
  pnl: string | number;
  riskAmount: number;
  images: string[];
  date: string;
  accountId?: string;
}

export function TradeModal({ isOpen, onClose, onSuccess, initialData }: TradeModalProps) {
  const router = useRouter();
  
  // Función para forzar la actualización de datos
  const fetchTrades = async () => {
    try {
      const response = await fetch("/api/trades");
      if (response.ok) {
        const data = await response.json();
        // Solo necesitamos forzar la petición para actualizar la caché
        console.log("Trades actualizados:", data.length);
      }
    } catch (error) {
      console.error("Error al actualizar trades:", error);
    }
  };
  const dataFetchedRef = useRef<boolean>(false);
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [accounts, setAccounts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  const [newPair, setNewPair] = useState("");
  const [showNewPairInput, setShowNewPairInput] = useState(false);

  const [formData, setFormData] = useState({
    tradingPairId: '',
    direction: 'LONG',
    bias: 'NEUTRAL',
    biasExplanation: '',
    psychology: '',
    result: 'WIN',
    pnl: '0',
    riskAmount: 0,
    images: [] as string[],
    date: new Date().toISOString().split('T')[0],
    accountId: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        tradingPairId: initialData.tradingPair.id,
        direction: initialData.direction,
        bias: initialData.bias,
        biasExplanation: initialData.biasExplanation || '',
        psychology: initialData.psychology || '',
        result: initialData.result,
        pnl: Math.abs(initialData.pnl).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }),
        riskAmount: initialData.riskAmount || 0,
        images: initialData.images,
        date: initialData.date || new Date().toISOString().split('T')[0],
        accountId: initialData.accountId || '',
      });
      if (initialData.date) {
        setDate(new Date(initialData.date));
      }
    } else if (isOpen) {
      // Resetear el formulario cuando se abre para crear un nuevo trade
      setFormData({
        tradingPairId: '',
        direction: 'LONG',
        bias: 'NEUTRAL',
        biasExplanation: '',
        psychology: '',
        result: 'WIN',
        pnl: '0',
        riskAmount: 0,
        images: [],
        date: new Date().toISOString().split('T')[0],
        accountId: '',
      });
      setDate(new Date());
    }
  }, [initialData, isOpen]);

  const loadInitialData = async () => {
    if (dataFetchedRef.current || !isOpen) return;
    
    setIsLoading(true);
    try {
      await Promise.all([fetchTradingPairs(), fetchAccounts()]);
      dataFetchedRef.current = true;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      dataFetchedRef.current = false;
    } else {
      loadInitialData();
    }
  }, [isOpen]);

  const fetchTradingPairs = async () => {
    try {
      const response = await fetch("/api/trading-pairs");
      if (!response.ok) {
        throw new Error("Error al cargar los pares de trading");
      }
      const data = await response.json();
      setTradingPairs(data || []);
    } catch (error) {
      console.error("Error al obtener pares:", error);
      showToast("Error al cargar los pares de trading", "error");
      setTradingPairs([]);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (!res.ok) {
        throw new Error('Error al cargar las cuentas');
      }
      const data = await res.json();
      setAccounts(data || []);
      
      // Si no hay cuenta seleccionada y hay cuentas disponibles, seleccionar la primera
      if (data?.length > 0) {
        setFormData(prev => {
          // Solo actualizar si no hay un accountId seleccionado
          if (!prev.accountId) {
            return { ...prev, accountId: data[0].id };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error al cargar las cuentas:', error);
      showToast('Error al cargar las cuentas', 'error');
      setAccounts([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar campos requeridos
      if (!formData.tradingPairId) {
        showToast('Debes seleccionar un par de trading', 'error');
        setIsSubmitting(false);
        return;
      }

      if (!formData.accountId) {
        showToast('Debes seleccionar una cuenta', 'error');
        setIsSubmitting(false);
        return;
      }

      if (!date) {
        showToast('Debes seleccionar una fecha', 'error');
        setIsSubmitting(false);
        return;
      }

      // Convertir el PnL a número y aplicar el signo según el resultado
      const pnlValue = Math.abs(parseFloat(formData.pnl.replace(/,/g, '')) || 0);
      const finalPnl = formData.result === 'LOSS' ? -pnlValue : pnlValue;

      // Crear fecha en hora local para evitar problemas de zona horaria
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);

      const dataToSubmit = {
        tradingPairId: formData.tradingPairId,
        direction: formData.direction,
        bias: formData.bias,
        biasExplanation: formData.biasExplanation,
        psychology: formData.psychology,
        result: formData.result,
        pnl: finalPnl,
        riskAmount: formData.riskAmount,
        images: formData.images,
        date: localDate.toISOString(),
        accountId: formData.accountId
      };

      const endpoint = initialData ? `/api/trades/${initialData.id}` : '/api/trades';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el trade');
      }

      showToast(
        initialData ? 'Trade actualizado correctamente' : 'Trade creado correctamente',
        'success'
      );
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Forzar refresco de los datos antes de cerrar el modal
      fetchTrades();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      showToast(error instanceof Error ? error.message : 'Error al guardar el trade', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewPair = async () => {
    if (!newPair.trim()) return;
    
    // Verificar límite de 10 pares
    if (tradingPairs.length >= 10) {
      showToast('Solo puedes tener un máximo de 10 pares de trading', 'error');
      return;
    }
    
    try {
      const response = await fetch("/api/trading-pairs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newPair.toUpperCase() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el par de trading");
      }

      const newPairData = await response.json();
      setTradingPairs(prev => [...prev, newPairData]);
      setFormData(prev => ({ ...prev, tradingPairId: newPairData.id }));
      setNewPair("");
      setShowNewPairInput(false);
      showToast("Par de trading creado correctamente", "success");
    } catch (error) {
      console.error("Error:", error);
      showToast(error instanceof Error ? error.message : "Error al crear el par de trading", "error");
    }
  };

  const handleDeletePair = async (pairId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este par de trading?")) return;

    try {
      const response = await fetch(`/api/trading-pairs/${pairId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el par de trading");
      }

      setTradingPairs(prev => prev.filter(pair => pair.id !== pairId));
      if (formData.tradingPairId === pairId) {
        setFormData(prev => ({ ...prev, tradingPairId: '' }));
      }
      showToast("Par de trading eliminado correctamente", "success");
    } catch (error) {
      console.error("Error:", error);
      showToast(error instanceof Error ? error.message : "Error al eliminar el par de trading", "error");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full p-0 overflow-hidden flex flex-col rounded-xl border border-gray-800/50 backdrop-blur-md">
        <div className="flex flex-col md:flex-row h-full">
          {/* Panel lateral con información del trade */}
          <div className="bg-gradient-to-br from-gray-900 to-black p-6 md:w-[320px] border-r border-gray-800/50 flex flex-col">
            <DialogHeader className="mb-6 pb-4 border-b border-gray-800/50">
              <DialogTitle className="text-2xl font-bold text-white">
                {initialData ? 'Editar Trade' : 'Nuevo Trade'}
              </DialogTitle>
              <p className="text-gray-400 mt-2 text-sm">
                Completa la información para {initialData ? 'actualizar el' : 'registrar un nuevo'} trade
              </p>
            </DialogHeader>
            
            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <Label className="text-gray-300">Fecha</Label>
                <DatePicker date={date} setDate={setDate} />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Par de trading</Label>
                {showNewPairInput ? (
                  <div className="flex gap-2">
                    <Input
                      value={newPair}
                      onChange={(e) => setNewPair(e.target.value)}
                      placeholder="Ej: BTC/USD"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddNewPair();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddNewPair}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setShowNewPairInput(false);
                        setNewPair("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select
                      value={formData.tradingPairId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, tradingPairId: value }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecciona un par" />
                      </SelectTrigger>
                      <SelectContent>
                        {tradingPairs.map((pair: any) => (
                          <div key={pair.id} className="flex items-center group px-2 py-1.5 mx-1 rounded-lg">
                            <SelectItem 
                              value={pair.id}
                              className="text-white/80 hover:text-white hover:bg-transparent flex-1 border-0 px-0 py-0 focus:bg-transparent data-[highlighted]:bg-transparent"
                            >
                              {pair.name}
                            </SelectItem>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeletePair(pair.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-500/20 rounded-md text-red-400 hover:text-red-300 ml-2"
                              title="Eliminar par"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowNewPairInput(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Cuenta</Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(value) => {
                    if (value === 'create_account') {
                      router.push('/accounts');
                      onClose();
                      return;
                    }
                    setFormData((prev) => ({ ...prev, accountId: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.length > 0 ? (
                      accounts.map((account: any) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.broker})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem 
                        value="create_account" 
                        className="flex items-center justify-center gap-2 text-blue-400 font-medium p-2 m-1 rounded-md hover:bg-blue-500/10 hover:text-blue-300 transition-colors cursor-pointer border border-blue-500/20"
                      >
                        <Plus className="h-4 w-4" />
                        Crear nueva cuenta
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-800/50">
              <Button type="submit" form="trade-form" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar Trade' : 'Crear Trade'}
              </Button>
              <Button variant="ghost" type="button" onClick={onClose} className="w-full mt-2">
                Cancelar
              </Button>
            </div>
          </div>

          {/* Contenido principal del formulario */}
          <div className="flex-1 p-6 overflow-y-auto">
            <form id="trade-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Primera fila: Dirección, Resultado, PnL y Riesgo */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Dirección</Label>
                  <TagSelector
                    value={formData.direction}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, direction: value }))
                    }
                    options={[
                      { 
                        value: 'LONG', 
                        label: 'Long',
                        color: "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                      },
                      { 
                        value: 'SHORT', 
                        label: 'Short',
                        color: "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                      }
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Resultado</Label>
                  <TagSelector
                    value={formData.result}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, result: value }))
                    }
                    options={[
                      { 
                        value: 'WIN', 
                        label: 'Ganador',
                        color: "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                      },
                      { 
                        value: 'LOSS', 
                        label: 'Perdedor',
                        color: "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                      },
                      { 
                        value: 'BREAKEVEN', 
                        label: 'Break Even',
                        color: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30"
                      }
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Ganancias/Pérdidas</Label>
                  <Input
                    type="text"
                    placeholder="$"
                    value={formData.pnl}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Permitir números, punto decimal y comas
                      if (/^[0-9.,]*$/.test(value)) {
                        // Eliminar todas las comas para el cálculo
                        const cleanValue = value.replace(/,/g, '');
                        // Si hay más de un punto decimal, mantener solo el primero
                        const parts = cleanValue.split('.');
                        if (parts.length > 2) {
                          const formattedValue = parts[0] + '.' + parts.slice(1).join('');
                          setFormData(prev => ({ ...prev, pnl: formattedValue }));
                        } else {
                          setFormData(prev => ({ ...prev, pnl: cleanValue }));
                        }
                      }
                    }}
                    onBlur={(e) => {
                      // Formatear el número al perder el foco
                      const value = e.target.value.replace(/,/g, '');
                      const numValue = parseFloat(value) || 0;
                      setFormData(prev => ({ 
                        ...prev, 
                        pnl: numValue.toLocaleString('en-US', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        }) 
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Riesgo</Label>
                  <Input
                    type="number"
                    value={formData.riskAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        riskAmount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Segunda fila: Bias */}
              <div className="space-y-2">
                <Label className="text-gray-300">Bias</Label>
                <TagSelector
                  value={formData.bias}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, bias: value }))
                  }
                  options={[
                    { 
                      value: 'BULLISH', 
                      label: 'Alcista',
                      color: "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                    },
                    { 
                      value: 'BEARISH', 
                      label: 'Bajista',
                      color: "bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
                    },
                    { 
                      value: 'NEUTRAL', 
                      label: 'Neutral',
                      color: "bg-gray-500/20 border-gray-500/30 text-gray-400 hover:bg-gray-500/30"
                    }
                  ]}
                />
              </div>

              {/* Tercera fila: Explicación y Psicología */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-gray-300">Explicación del bias</Label>
                  <Textarea
                    value={formData.biasExplanation}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, biasExplanation: e.target.value }))
                    }
                    placeholder="Explica tu análisis..."
                    className="min-h-[150px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Psicología</Label>
                  <Textarea
                    value={formData.psychology}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, psychology: e.target.value }))
                    }
                    placeholder="¿Cómo te sentiste durante el trade?"
                    className="min-h-[150px]"
                  />
                </div>
              </div>

              {/* Cuarta fila: Imágenes */}
              <div className="space-y-2">
                <Label className="text-gray-300">Imágenes</Label>
                <ImageDropzone
                  images={formData.images}
                  existingImages={[]}
                  onAddImages={(urls) => {
                    setFormData((prev) => ({
                      ...prev,
                      images: [...prev.images, ...urls],
                    }));
                  }}
                  onRemoveImage={(index) => {
                    setFormData((prev) => ({
                      ...prev,
                      images: prev.images.filter((_, i) => i !== index),
                    }));
                  }}
                  onRemoveExistingImage={(index) => {
                    // Este método ya no se usará pero lo dejamos por compatibilidad
                    console.log("onRemoveExistingImage no se utiliza");
                  }}
                />
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 