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
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white/60">Cargando cuentas...</div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center text-white/60 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
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
            className="p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
            onClick={() => router.push(`/accounts?id=${account.id}`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">{account.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm">
                    {account.broker}
                  </span>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
                    account.type === "Fondeada" 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  )}>
                    {account.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-white">
                  {formatCurrency(account.balance)}
                </div>
                <div className={cn(
                  "text-xs font-medium",
                  isPositive ? "text-emerald-300" : "text-rose-300"
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