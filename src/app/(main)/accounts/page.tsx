"use client";

import { AccountsDataTable } from "@/components/accounts-data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AccountModal } from "@/components/ui/AccountModal";

export default function AccountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-white">
            Gestión de Cuentas
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Administra tus cuentas de trading
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1c1c1c] hover:bg-[#2a2a2a] text-white rounded-lg px-4 py-2 h-10 font-medium border border-gray-800/50 hover:border-gray-700/50 transition-all flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Agregar Cuenta
        </Button>
      </div>

      <div className="rounded-xl bg-[#0A0A0A]/60 border border-gray-800/50 backdrop-blur-sm p-6">
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