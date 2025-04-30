'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Account {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
  broker: string;
  type: 'Fondeada' | 'Challenge';
  currency: string;
}

export function AccountPreview() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/accounts');
        if (!response.ok) {
          throw new Error('Error al cargar las cuentas');
        }
        const data = await response.json();
        // Mostrar solo hasta 3 cuentas en la vista previa
        setAccounts(data?.slice(0, 3) || []);
      } catch (error) {
        console.error('Error al obtener cuentas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Cargando cuentas...</div>;
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center text-gray-400 p-4">
        No hay cuentas registradas. Añade cuentas para gestionarlas aquí.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => {
        const percentageChange = ((account.balance - account.initialBalance) / account.initialBalance) * 100;
        const isPositive = account.balance >= account.initialBalance;

        return (
          <div
            key={account.id}
            className="p-4 border border-gray-800 rounded-lg bg-gray-900/50 hover:bg-gray-800/50 transition-colors cursor-pointer"
            onClick={() => router.push(`/accounts?id=${account.id}`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white">{account.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {account.broker}
                  </span>
                  <span className={cn(
                    "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                    account.type === "Fondeada" 
                      ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  )}>
                    {account.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-medium text-white">
                  {formatCurrency(account.balance)}
                </div>
                <div className={cn(
                  "text-xs",
                  isPositive ? "text-green-400" : "text-red-400"
                )}>
                  {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 