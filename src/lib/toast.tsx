import React from 'react';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  BadgeCheck,
  AlertOctagon,
  Bell,
  ShieldAlert
} from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export function showToast(message: string, type: ToastType = 'success') {
  let icon: React.ReactNode = null;
  
  switch (type) {
    case 'success':
      icon = <BadgeCheck className="h-5 w-5 text-green-500" />;
      break;
    case 'error':
      icon = <AlertOctagon className="h-5 w-5 text-red-500" />;
      break;
    case 'warning':
      icon = <ShieldAlert className="h-5 w-5 text-yellow-500" />;
      break;
    case 'info':
      icon = <Bell className="h-5 w-5 text-blue-500" />;
      break;
  }
  
  toast(message, {
    className: `toast-${type}`,
    duration: 4000,
    icon,
    position: 'top-center',
  });
} 