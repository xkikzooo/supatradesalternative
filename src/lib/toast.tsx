import React from 'react';
import { toast } from 'sonner';
import { 
  BadgeCheck,
  AlertOctagon,
  Bell,
  ShieldAlert,
  X,
} from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

// Componente personalizado para el botón de cierre
const CloseButton = ({ closeToast }: { closeToast: () => void }) => (
  <button
    onClick={closeToast}
    className="absolute top-2 right-2 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all duration-200"
  >
    <X className="h-4 w-4" />
  </button>
);

export function showToast(message: string, type: ToastType = 'success') {
  let icon: React.ReactNode = null;
  let className = '';
  
  switch (type) {
    case 'success':
      icon = <BadgeCheck className="h-5 w-5 text-emerald-400" />;
      className = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
      break;
    case 'error':
      icon = <AlertOctagon className="h-5 w-5 text-red-400" />;
      className = 'bg-red-500/10 border-red-500/20 text-red-300';
      break;
    case 'warning':
      icon = <ShieldAlert className="h-5 w-5 text-amber-400" />;
      className = 'bg-amber-500/10 border-amber-500/20 text-amber-300';
      break;
    case 'info':
      icon = <Bell className="h-5 w-5 text-blue-400" />;
      className = 'bg-blue-500/10 border-blue-500/20 text-blue-300';
      break;
  }
  
  // Duración según el tipo
  const duration = type === 'error' ? 5000 : 
                  type === 'warning' ? 4000 : 3000;
  
  // Limpiar toasts existentes si es un error o advertencia
  if (type === 'error' || type === 'warning') {
    toast.dismiss();
  }
  
  return toast(message, {
    className: `toast-${type} ${className}`,
    duration: duration,
    icon,
    style: {
      background: 'rgba(0, 0, 0, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      padding: '16px',
      fontSize: '14px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    },
  });
} 