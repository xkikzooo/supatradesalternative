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
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

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

export default function NewTradePage() {
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
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateString, setDateString] = useState<string>(new Date().toISOString().split('T')[0]);
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
    accountIds: [] as string[],
  });

  const loadInitialData = async () => {
    if (dataFetchedRef.current) return;
    
    setIsLoading(true);
    try {
      await Promise.all([fetchTradingPairs(), fetchAccounts()]);
      dataFetchedRef.current = true;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Sincronizar dateString y date
  useEffect(() => {
    if (dateString) {
      setDate(new Date(dateString));
    }
  }, [dateString]);

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

      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el trade');
      }

      showToast('Trade creado correctamente', 'success');
      
      // Forzar refresco de los datos antes de volver
      fetchTrades();
      router.push('/trades');
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            onClick={() => router.push('/trades')}
            variant="ghost" 
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Nuevo Trade</h1>
            <p className="text-sm text-gray-400">
              Completa la información para registrar un nuevo trade
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800/50 p-6 rounded-xl">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Panel lateral con información del trade */}
          <div className="bg-gradient-to-br from-gray-900 to-black p-6 md:w-[320px] rounded-xl border border-gray-800/50 flex flex-col">
            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <Label className="text-gray-300">Fecha</Label>
                <Input
                  type="date"
                  value={dateString}
                  onChange={(e) => setDateString(e.target.value)}
                  className={cn(
                    "w-full",
                    "bg-gradient-to-b from-gray-900 to-gray-800",
                    "border border-gray-700 shadow-sm",
                    "hover:bg-gradient-to-b hover:from-gray-800 hover:to-gray-700",
                    "hover:border-blue-500/50 hover:shadow-blue-500/20 hover:shadow-md",
                    "transition-all duration-200"
                  )}
                />
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
                <Label className="text-gray-300">Cuentas</Label>
                <div className="relative">
                  <Select
                    value="_multiple_"
                    onValueChange={(value) => {
                      if (value === 'create_account') {
                        router.push('/accounts');
                        return;
                      }
                      
                      // Si la cuenta ya está seleccionada, la quitamos
                      if (formData.accountIds.includes(value)) {
                        setFormData(prev => ({
                          ...prev,
                          accountIds: prev.accountIds.filter(id => id !== value)
                        }));
                      } else {
                        // Si no está seleccionada, la agregamos
                        setFormData(prev => ({
                          ...prev,
                          accountIds: [...prev.accountIds, value]
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona cuentas">
                        {formData.accountIds.length === 0 ? 
                          "Selecciona cuentas" : 
                          `${formData.accountIds.length} cuenta${formData.accountIds.length !== 1 ? 's' : ''} seleccionada${formData.accountIds.length !== 1 ? 's' : ''}`
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.length > 0 ? (
                        accounts.map((account: any) => (
                          <SelectItem 
                            key={account.id} 
                            value={account.id}
                            className="flex items-center gap-2"
                          >
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="checkbox"
                                checked={formData.accountIds.includes(account.id)}
                                className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-600"
                                readOnly
                              />
                              <span>{account.name} ({account.broker})</span>
                            </div>
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
                  
                  {formData.accountIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.accountIds.map(id => {
                        const account = accounts.find((a: any) => a.id === id);
                        return account ? (
                          <div key={id} className="bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                            <span>{account.name}</span>
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-white" 
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

            <div className="mt-auto pt-6 border-t border-gray-800/50">
              <Button type="submit" form="trade-form" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Crear Trade'}
              </Button>
              <Button variant="ghost" type="button" onClick={() => router.push('/trades')} className="w-full mt-2">
                Cancelar
              </Button>
            </div>
          </div>

          {/* Contenido principal del formulario */}
          <div className="flex-1">
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
      </div>
    </div>
  );
} 