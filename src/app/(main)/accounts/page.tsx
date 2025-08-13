"use client";

import { AccountsDataTable } from "@/components/accounts-data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AccountModal } from "@/components/ui/AccountModal";

export default function AccountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Gestión de Cuentas
            </h1>
            <p className="text-white/70">
              Administra tus cuentas de trading
            </p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-500/80 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Agregar Cuenta
          </Button>
        </div>
      </div>

      {/* Tabla de Cuentas */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <AccountsDataTable />
      </div>

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setIsModalOpen(false)}
      />
    </div>
  );
} 