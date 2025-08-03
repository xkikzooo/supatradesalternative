'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { ImageDropzone } from '@/components/ui/ImageDropzone';
import { TagSelector } from '@/components/ui/tag-selector';
import { showToast } from '@/lib/toast';
import { X, Plus, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";

interface TradingPair {
  id: string;
  name: string;
}

interface TradingAccount {
  id: string;
  name: string;
  broker: string;
  balance: number;
  type: string;
}

interface Trade {
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
}

interface TradeFormProps {
  mode: 'create' | 'edit';
  tradeId?: string;
  initialTrade?: Trade | null;
}

export function TradeForm({ mode, tradeId, initialTrade }: TradeFormProps) {
  const router = useRouter();
  const isEditMode = mode === 'edit';
  
  // Función para forzar la actualización de datos
  const fetchTrades = async () => {
    try {
      const response = await fetch("/api/trades");
      if (response.ok) {
        const data = await response.json();
        console.log("Trades actualizados:", data.length);
      }
    } catch (error) {
      console.error("Error al actualizar trades:", error);
    }
  };
  
  const dataFetchedRef = useRef<boolean>(false);
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateString, setDateString] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newPair, setNewPair] = useState("");
  const [showNewPairInput, setShowNewPairInput] = useState(false);

  const [formData, setFormData] = useState({
    tradingPairId: '',
    direction: 'LONG' as 'LONG' | 'SHORT',
    bias: 'NEUTRAL',
    biasExplanation: '',
    psychology: '',
    result: 'WIN',
    pnl: '0',
    riskAmount: 0,
    images: [] as string[],
    date: new Date().toISOString().split('T')[0],
    accountIds: [] as string[],
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      if (dataFetchedRef.current) return;
      
      setIsLoading(true);
      try {
        await Promise.all([fetchTradingPairs(), fetchAccounts()]);
        
        // Si es modo edición, cargar el trade específico
        if (isEditMode && tradeId) {
          await fetchTrade();
        }
        
        dataFetchedRef.current = true;
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [isEditMode, tradeId]);

  // Sincronizar dateString y date
  useEffect(() => {
    if (dateString) {
      setDate(new Date(dateString));
    }
  }, [dateString]);

  const fetchTrade = async () => {
    if (!tradeId) return;
    
    try {
      const response = await fetch(`/api/trades/${tradeId}`);
      
      if (!response.ok) {
        let errorMessage = "Error al cargar el trade";
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Si no se puede parsear el error, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      const tradeData: Trade = await response.json();
      setTrade(tradeData);
      
      // Actualizar el formulario con los datos del trade
      const pnlValue = Math.abs(tradeData.pnl);
      setFormData({
        tradingPairId: tradeData.tradingPair.id,
        direction: tradeData.direction,
        bias: tradeData.bias,
        biasExplanation: tradeData.biasExplanation || '',
        psychology: tradeData.psychology || '',
        result: tradeData.result,
        pnl: pnlValue.toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }),
        riskAmount: tradeData.riskAmount || 0,
        images: tradeData.images || [],
        date: tradeData.date ? new Date(tradeData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        accountIds: tradeData.accountId ? [tradeData.accountId] : [],
      });
      
      setDateString(tradeData.date ? new Date(tradeData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error("Error al cargar el trade:", error);
      showToast(error instanceof Error ? error.message : "Error al cargar el trade", "error");
      router.push('/trades');
    }
  };

  const [trade, setTrade] = useState<Trade | null>(initialTrade || null);

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
      if (data?.length > 0 && formData.accountIds.length === 0) {
        setFormData(prev => {
          return { ...prev, accountIds: [data[0].id] };
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

      if (!formData.accountIds.length) {
        showToast('Debes seleccionar al menos una cuenta', 'error');
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
        accountIds: formData.accountIds
      };

      const url = isEditMode ? `/api/trades/${tradeId}` : '/api/trades';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${isEditMode ? 'actualizar' : 'guardar'} el trade`);
      }

      showToast(`Trade ${isEditMode ? 'actualizado' : 'creado'} correctamente`, 'success');
      
      // Forzar refresco de los datos antes de volver
      fetchTrades();
      router.push('/trades');
    } catch (error) {
      console.error('Error:', error);
      showToast(error instanceof Error ? error.message : `Error al ${isEditMode ? 'actualizar' : 'guardar'} el trade`, 'error');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60 text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <div className="flex items-center">
          <Button 
            onClick={() => router.push('/trades')}
            variant="ghost" 
            className="mr-4 p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-white/70" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isEditMode ? 'Editar Trade' : 'Nuevo Trade'}
            </h1>
            <p className="text-white/70">
              {isEditMode ? 'Modifica la información del trade' : 'Registra un nuevo trade con toda la información relevante'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
        <form id="trade-form" onSubmit={handleSubmit} className="space-y-8">
          
          {/* Sección 1: Información Básica del Trade */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-3">
              Información Básica
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Fecha */}
              <div className="space-y-2">
                <Label className="text-white/80 font-medium">Fecha del Trade</Label>
                <Input
                  type="date"
                  value={dateString}
                  onChange={(e) => setDateString(e.target.value)}
                  className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                />
              </div>

              {/* Par de Trading */}
              <div className="space-y-2">
                <Label className="text-white/80 font-medium">Par de Trading</Label>
                {showNewPairInput ? (
                  <div className="flex gap-2">
                    <Input
                      value={newPair}
                      onChange={(e) => setNewPair(e.target.value)}
                      placeholder="Ej: BTC/USD"
                      className="flex-1 px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
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
                      className="px-3 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 rounded-xl transition-all duration-200"
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
                      className="px-3 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 rounded-xl transition-all duration-200"
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
                      <SelectTrigger className="flex-1 px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 rounded-xl transition-all duration-200">
                        <SelectValue placeholder="Selecciona un par" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                        {tradingPairs.map((pair: any) => (
                          <SelectItem 
                            key={pair.id} 
                            value={pair.id}
                            className="text-white/80 hover:text-white hover:bg-white/10"
                          >
                            {pair.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowNewPairInput(true)}
                      className="px-3 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 rounded-xl transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Cuentas */}
              <div className="space-y-2">
                <Label className="text-white/80 font-medium">Cuentas</Label>
                <div className="relative">
                  <Select
                    value="_multiple_"
                    onValueChange={(value) => {
                      if (value === 'create_account') {
                        router.push('/accounts');
                        return;
                      }
                      
                      if (formData.accountIds.includes(value)) {
                        setFormData(prev => ({
                          ...prev,
                          accountIds: prev.accountIds.filter(id => id !== value)
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          accountIds: [...prev.accountIds, value]
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 rounded-xl transition-all duration-200">
                      <SelectValue placeholder="Selecciona cuentas">
                        {formData.accountIds.length === 0 ? 
                          "Selecciona cuentas" : 
                          `${formData.accountIds.length} cuenta${formData.accountIds.length !== 1 ? 's' : ''} seleccionada${formData.accountIds.length !== 1 ? 's' : ''}`
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                      {accounts.length > 0 ? (
                        accounts.map((account: any) => (
                          <SelectItem 
                            key={account.id} 
                            value={account.id}
                            className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10"
                          >
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="checkbox"
                                checked={formData.accountIds.includes(account.id)}
                                className="h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500"
                                readOnly
                              />
                              <span>{account.name} ({account.broker})</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem 
                          value="create_account" 
                          className="flex items-center justify-center gap-2 text-blue-400 font-medium p-2 m-1 rounded-xl hover:bg-blue-500/10 hover:text-blue-300 transition-colors cursor-pointer border border-blue-500/20"
                        >
                          <Plus className="h-4 w-4" />
                          Crear nueva cuenta
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  
                  {formData.accountIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.accountIds.map(id => {
                        const account = accounts.find((a: any) => a.id === id);
                        return account ? (
                          <div key={id} className="bg-white/10 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 border border-white/20">
                            <span>{account.name}</span>
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-white transition-colors" 
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                accountIds: prev.accountIds.filter(accId => accId !== id)
                              }))}
                            />
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sección 2: Análisis y Dirección */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-3">
              Análisis y Dirección
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bias */}
              <div className="space-y-2">
                <Label className="text-white/80 font-medium">Bias del Mercado</Label>
                <TagSelector
                  value={formData.bias}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, bias: value }))
                  }
                  options={[
                    { 
                      value: 'BULLISH', 
                      label: 'Alcista',
                      color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
                    },
                    { 
                      value: 'BEARISH', 
                      label: 'Bajista',
                      color: "bg-rose-500/20 border-rose-500/30 text-rose-300 hover:bg-rose-500/30"
                    },
                    { 
                      value: 'NEUTRAL', 
                      label: 'Neutral',
                      color: "bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30"
                    }
                  ]}
                />
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <Label className="text-white/80 font-medium">Dirección del Trade</Label>
                <TagSelector
                  value={formData.direction}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, direction: value }))
                  }
                  options={[
                    { 
                      value: 'LONG', 
                      label: 'Long',
                      color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
                    },
                    { 
                      value: 'SHORT', 
                      label: 'Short',
                      color: "bg-rose-500/20 border-rose-500/30 text-rose-300 hover:bg-rose-500/30"
                    }
                  ]}
                />
              </div>
            </div>

            {/* Explicación del Bias */}
            <div className="space-y-2">
              <Label className="text-white/80 font-medium">Explicación del Análisis</Label>
              <Textarea
                value={formData.biasExplanation}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, biasExplanation: e.target.value }))
                }
                placeholder="Explica tu análisis técnico, fundamental o de sentimiento del mercado..."
                className="min-h-[120px] px-4 py-3 border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Sección 3: Resultados y Gestión de Riesgo */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-3">
              Resultados y Gestión de Riesgo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Resultado */}
              <div className="space-y-2">
                <Label className="text-white/80 font-medium">Resultado</Label>
                <TagSelector
                  value={formData.result}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, result: value }))
                  }
                  options={[
                    { 
                      value: 'WIN', 
                      label: 'Ganador',
                      color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
                    },
                    { 
                      value: 'LOSS', 
                      label: 'Perdedor',
                      color: "bg-rose-500/20 border-rose-500/30 text-rose-300 hover:bg-rose-500/30"
                    },
                    { 
                      value: 'BREAKEVEN', 
                      label: 'Break Even',
                      color: "bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30"
                    }
                  ]}
                />
              </div>

              {/* PnL */}
              <div className="space-y-2">
                <Label className="text-white/80 font-medium">Ganancias/Pérdidas</Label>
                <Input
                  type="text"
                  placeholder="$0.00"
                  value={formData.pnl}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[0-9.,]*$/.test(value)) {
                      const cleanValue = value.replace(/,/g, '');
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
                  className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                />
              </div>

              {/* Riesgo */}
              <div className="space-y-2">
                <Label className="text-white/80 font-medium">Riesgo (R)</Label>
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
                  className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                />
              </div>

              {/* Ratio R:R (calculado automáticamente) */}
              <div className="space-y-2">
                <Label className="text-white/80 font-medium">Ratio R:R</Label>
                <div className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white rounded-xl">
                  {formData.riskAmount > 0 && parseFloat(formData.pnl.replace(/,/g, '')) !== 0 ? 
                    (parseFloat(formData.pnl.replace(/,/g, '')) / formData.riskAmount).toFixed(2) : 
                    '0.00'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Sección 4: Psicología y Reflexiones */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-3">
              Psicología y Reflexiones
            </h2>
            
            <div className="space-y-2">
              <Label className="text-white/80 font-medium">Psicología del Trade</Label>
              <Textarea
                value={formData.psychology}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, psychology: e.target.value }))
                }
                placeholder="¿Cómo te sentiste durante el trade? ¿Qué aprendiste? ¿Qué harías diferente?"
                className="min-h-[120px] px-4 py-3 border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Sección 5: Evidencia Visual */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-3">
              Evidencia Visual
            </h2>
            
            <div className="space-y-2">
              <Label className="text-white/80 font-medium">Capturas de Pantalla</Label>
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
                  console.log("onRemoveExistingImage no se utiliza");
                }}
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4 pt-6 border-t border-white/10">
            <Button 
              type="submit" 
              className="flex-1 px-6 py-3 bg-blue-500/80 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? `${isEditMode ? 'Actualizando' : 'Guardando'} Trade...` : `${isEditMode ? 'Actualizar' : 'Crear'} Trade`}
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => router.push('/trades')} 
              className="px-6 py-3 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 rounded-xl transition-all duration-200"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 