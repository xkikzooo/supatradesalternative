import { toast } from 'sonner';

type ToastType = 'success' | 'error' | 'warning';

export function showToast(message: string, type: ToastType = 'success') {
  toast(message, {
    className: `toast-custom toast-${type}`,
    duration: 3000,
  });
} 