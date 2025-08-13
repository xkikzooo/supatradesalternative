'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showToast } from "@/lib/toast";
import { Label } from "@/components/ui/label";
import { Wallet, DollarSign, Building2, User, X, Save, AlertTriangle } from "lucide-react";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: {
    id: string;
    name: string;
    balance: number;
    initialBalance: number;
    broker: string;
    type: string;
    currency: string;
    riskPerTrade?: string;
  };
}

export function AccountModal({ isOpen, onClose, onSuccess, initialData }: AccountModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Función para forzar la actualización de datos
  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts");
      if (response.ok) {
        const data = await response.json();
        // Solo necesitamos forzar la petición para actualizar la caché
        console.log("Cuentas actualizadas:", data.length);
      }
    } catch (error) {
      console.error("Error al actualizar cuentas:", error);
    }
  };
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    initialBalance: '',
    broker: '',
    type: '',
    currency: '',
    riskPerTrade: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        balance: initialData.balance?.toString() || '',
        initialBalance: initialData.initialBalance?.toString() || '',
        broker: initialData.broker || '',
        type: initialData.type || '',
        currency: initialData.currency || '',
        riskPerTrade: initialData.riskPerTrade || '',
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        balance: '',
        initialBalance: '',
        broker: '',
        type: '',
        currency: '',
        riskPerTrade: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const endpoint = initialData ? `/api/accounts/${initialData.id}` : '/api/accounts';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: initialData?.id,
          ...formData,
          balance: parseFloat(formData.balance),
          initialBalance: parseFloat(formData.initialBalance),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la cuenta');
      }

      showToast(initialData ? 'Cuenta actualizada correctamente' : 'Cuenta creada correctamente', 'success');
      
      // Forzar refresco de los datos antes de cerrar el modal
      fetchAccounts();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : "Error al guardar la cuenta");
      showToast(error instanceof Error ? error.message : "Error al guardar la cuenta", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl max-w-2xl">
        <DialogHeader className="flex flex-row items-center gap-3">
          <Wallet className="h-6 w-6 text-blue-400" />
          <DialogTitle className="text-xl font-semibold text-white">
            {initialData ? 'Editar Cuenta' : 'Nueva Cuenta'}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-auto text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" />
              Información básica
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">Nombre de la cuenta</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Cuenta Principal"
                  required
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="broker" className="text-white/80">Broker</Label>
                <Input
                  id="broker"
                  value={formData.broker}
                  onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                  placeholder="Ej: FTMO, MFF, etc."
                  required
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Balance y finanzas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              Balance y finanzas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="balance" className="text-white/80">Balance Actual</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                  required
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialBalance" className="text-white/80">Balance Inicial</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  step="0.01"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                  placeholder="0.00"
                  required
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-400" />
              Configuración
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-white/80">Tipo de cuenta</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger className="bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20">
                    <SelectItem value="Challenge" className="text-white hover:bg-white/10">Challenge</SelectItem>
                    <SelectItem value="Fondeada" className="text-white hover:bg-white/10">Fondeada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-white/80">Moneda</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  required
                >
                  <SelectTrigger className="bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50">
                    <SelectValue placeholder="Selecciona moneda" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20">
                    <SelectItem value="USD" className="text-white hover:bg-white/10">USD</SelectItem>
                    <SelectItem value="EUR" className="text-white hover:bg-white/10">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskPerTrade" className="text-white/80">Riesgo por Trade (opcional)</Label>
              <Input
                id="riskPerTrade"
                value={formData.riskPerTrade}
                onChange={(e) => setFormData({ ...formData, riskPerTrade: e.target.value })}
                placeholder="Ej: 1% o $100"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl p-4 text-sm bg-red-500/10 text-red-300 border border-red-500/20 backdrop-blur-sm flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white rounded-xl transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-500/80 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {initialData ? "Actualizar" : "Crear"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 