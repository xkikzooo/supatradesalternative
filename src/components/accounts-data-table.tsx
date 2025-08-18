"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { AccountModal } from "./ui/AccountModal";
import { ConfirmDeleteModal } from "./ui/confirm-delete-modal";
import { toast } from "sonner";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Account {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
  broker: string;
  type: 'Fondeada' | 'Challenge';
  currency: string;
  createdAt: string;
  updatedAt: string;
  riskPerTrade?: string;
}

export function AccountsDataTable() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/accounts");
      if (!response.ok) {
        throw new Error("Error al cargar las cuentas");
      }
      const data = await response.json();
      setAccounts(data || []);
    } catch (error) {
      console.error("Error al obtener cuentas:", error);
      toast.error("Error al cargar las cuentas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleEdit = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      setSelectedAccount(account);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (accountId: string) => {
    try {
      const response = await fetch(`/api/accounts?id=${accountId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Error al eliminar la cuenta");
      }
      toast.success("Cuenta eliminada correctamente");
      fetchAccounts();
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      toast.error("Error al eliminar la cuenta");
    }
  };

  const handleModalClose = () => {
    setSelectedAccount(null);
    setIsModalOpen(false);
  };

  const handleModalSuccess = () => {
    fetchAccounts();
    handleModalClose();
  };

  const handleDeleteConfirm = async () => {
    if (selectedAccount) {
      await handleDelete(selectedAccount.id);
      setIsDeleteModalOpen(false);
      setSelectedAccount(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Cargando cuentas...</div>;
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10">
      <Table className="text-white">
        <TableHeader>
          <TableRow className="bg-white/5">
            <TableHead className="text-white/80">Nombre</TableHead>
            <TableHead className="text-white/80">Broker</TableHead>
            <TableHead className="text-white/80">Tipo</TableHead>
            <TableHead className="text-white/80">Balance</TableHead>
            <TableHead className="text-white/80">Inicial</TableHead>
            <TableHead className="text-white/80">Moneda</TableHead>
            <TableHead className="text-white/80">Riesgo/Trade</TableHead>
            <TableHead className="text-white/80">Creada</TableHead>
            <TableHead className="text-white/80">Actualizada</TableHead>
            <TableHead className="text-right text-white/80">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium text-white">{a.name}</TableCell>
              <TableCell className="text-white/80">{a.broker}</TableCell>
              <TableCell className="text-white/80">{a.type}</TableCell>
              <TableCell className="text-white">{formatCurrency(a.balance, a.currency)}</TableCell>
              <TableCell className="text-white/80">{formatCurrency(a.initialBalance, a.currency)}</TableCell>
              <TableCell className="text-white/70">{a.currency}</TableCell>
              <TableCell className="text-white/70">{a.riskPerTrade ?? '-'}</TableCell>
              <TableCell className="text-white/60">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-white/60">{new Date(a.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white/90" onClick={() => handleEdit(a.id)}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => { setSelectedAccount(a); setIsDeleteModalOpen(true); }}>Eliminar</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {accounts.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-white/60 py-8">No hay cuentas registradas.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AccountModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        initialData={selectedAccount || undefined}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAccount(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar cuenta"
        description={`¿Estás seguro de que quieres eliminar la cuenta "${selectedAccount?.name}"? Esta acción no se puede deshacer.`}
        type="danger"
        confirmText="Eliminar cuenta"
        cancelText="Cancelar"
      />
    </div>
  );
}
 