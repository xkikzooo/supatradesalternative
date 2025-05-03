'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showToast } from "@/lib/toast";
import { Label } from "@/components/ui/label";

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

      showToast(initialData ? 'Cuenta actualizada' : 'Cuenta creada', 'success');
      
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {initialData ? 'Editar Cuenta' : 'Nueva Cuenta'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre de la cuenta"
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Balance Actual</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                placeholder="Balance actual"
                required
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialBalance">Balance Inicial</Label>
              <Input
                id="initialBalance"
                type="number"
                step="0.01"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                placeholder="Balance inicial"
                required
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="broker">Broker</Label>
            <Input
              id="broker"
              value={formData.broker}
              onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
              placeholder="Nombre del broker"
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Challenge">Challenge</SelectItem>
                  <SelectItem value="Fondeada">Fondeada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
                required
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Selecciona moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskPerTrade">Riesgo por Trade (opcional)</Label>
            <Input
              id="riskPerTrade"
              value={formData.riskPerTrade}
              onChange={(e) => setFormData({ ...formData, riskPerTrade: e.target.value })}
              placeholder="Ej: 1%"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                <path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z"></path>
                <circle cx="12" cy="12" r="1"></circle>
                <path d="M12 8v3"></path>
              </svg>
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-gray-700 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 