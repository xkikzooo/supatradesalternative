"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { AccountModal } from "./ui/AccountModal";
import { AccountCard } from "./ui/AccountCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { toast } from "sonner";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  if (isLoading) {
    return <div className="text-center py-4">Cargando cuentas...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={handleEdit}
          onDelete={(id) => {
            setSelectedAccount(accounts.find(a => a.id === id) || null);
            setIsDeleteDialogOpen(true);
          }}
        />
      ))}

      <AccountModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        initialData={selectedAccount || undefined}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={() => setIsDeleteDialogOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que deseas eliminar esta cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
              {selectedAccount && (
                <span className="mt-2 block">
                  <span className="font-semibold">{selectedAccount.name}</span>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (selectedAccount) {
                  handleDelete(selectedAccount.id);
                  setIsDeleteDialogOpen(false);
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 