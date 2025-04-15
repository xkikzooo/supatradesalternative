'use client';

import { useState, useEffect } from "react";
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
import { Calendar as CalendarIcon, X, Plus, Trash2 } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

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
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [accounts, setAccounts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    }
  }, [initialData, isOpen]);

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
      if (!formData.accountId && data?.length > 0) {
        setFormData(prev => ({ ...prev, accountId: data[0].id }));
      } else if (data?.length === 0) {
        showToast('No hay cuentas disponibles. Debes crear una cuenta antes de crear un trade.', 'warning');
      }
    } catch (error) {
      console.error('Error al cargar las cuentas:', error);
      showToast('Error al cargar las cuentas', 'error');
      setAccounts([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTradingPairs();
      fetchAccounts();
    }
  }, [isOpen]);

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
        date: date.toISOString(),
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
      
      router.refresh();
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
    
    try {
      const response = await fetch("/api/trading-pairs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newPair.toUpperCase() }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el par de trading");
      }

      const newPairData = await response.json();
      setTradingPairs(prev => [...prev, newPairData]);
      setFormData(prev => ({ ...prev, tradingPairId: newPairData.id }));
      setNewPair("");
      setShowNewPairInput(false);
      showToast("Par de trading creado correctamente", "success");
    } catch (error) {
      console.error("Error:", error);
      showToast("Error al crear el par de trading", "error");
    }
  };

  const handleDeletePair = async (pairId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este par de trading?")) return;

    try {
      const response = await fetch(`/api/trading-pairs/${pairId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el par de trading");
      }

      setTradingPairs(prev => prev.filter(pair => pair.id !== pairId));
      if (formData.tradingPairId === pairId) {
        setFormData(prev => ({ ...prev, tradingPairId: '' }));
      }
      showToast("Par de trading eliminado correctamente", "success");
    } catch (error) {
      console.error("Error:", error);
      showToast("Error al eliminar el par de trading", "error");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Trade' : 'Nuevo Trade'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="space-y-6 flex-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Par de trading</Label>
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
                          <SelectItem 
                            key={pair.id} 
                            value={pair.id}
                          >
                            <span>{pair.name}</span>
                          </SelectItem>
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
                <Label>Cuenta</Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, accountId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account: any) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.broker})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Dirección</Label>
                <TagSelector
                  value={formData.direction}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, direction: value }))
                  }
                  options={[
                    { value: 'LONG', label: 'Long' },
                    { value: 'SHORT', label: 'Short' }
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label>Resultado</Label>
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
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>PnL</Label>
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
                <Label>Riesgo</Label>
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

            <div className="space-y-2">
              <Label>Fecha</Label>
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
                      !date && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {date ? (
                      <span className="bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
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
                  <DayPicker
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={es}
                    className="bg-transparent"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Sesgo</Label>
              <TagSelector
                value={formData.bias}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, bias: value }))
                }
                options={[
                  { 
                    value: 'BULLISH', 
                    label: 'Alcista',
                    color: "bg-white/10 border-white/30 text-white hover:bg-white/20"
                  },
                  { 
                    value: 'BEARISH', 
                    label: 'Bajista',
                    color: "bg-white/10 border-white/30 text-white hover:bg-white/20"
                  },
                  { 
                    value: 'NEUTRAL', 
                    label: 'Neutral',
                    color: "bg-white/10 border-white/30 text-white hover:bg-white/20"
                  }
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label>Explicación del sesgo</Label>
              <Textarea
                value={formData.biasExplanation}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, biasExplanation: e.target.value }))
                }
                placeholder="Explica tu análisis..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Psicología</Label>
              <Textarea
                value={formData.psychology}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, psychology: e.target.value }))
                }
                placeholder="¿Cómo te sentiste durante el trade?"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Imágenes</Label>
              <ImageDropzone
                images={formData.images}
                existingImages={initialData?.images || []}
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
                  if (initialData) {
                    setFormData((prev) => ({
                      ...prev,
                      images: initialData.images.filter((_, i) => i !== index),
                    }));
                  }
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 bg-background pt-6 pb-4 border-t mt-auto">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 