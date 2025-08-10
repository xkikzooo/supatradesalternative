import { useQuery } from '@tanstack/react-query';

interface Account {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
  broker: string;
  type: 'Fondeada' | 'Challenge';
  currency: string;
}

// Función para obtener cuentas
const fetchAccounts = async (): Promise<Account[]> => {
  const response = await fetch('/api/accounts');
  if (!response.ok) {
    throw new Error('Error al cargar las cuentas');
  }
  const data = await response.json();
  return data || [];
};

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}; 