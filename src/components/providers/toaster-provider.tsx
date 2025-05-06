'use client';

import { Toaster as Sonner } from 'sonner';
import { X } from 'lucide-react';

export function ToasterProvider() {
  return (
    <Sonner
      position="top-right"
      expand={false}
      visibleToasts={3}
      theme="dark"
      toastOptions={{
        style: {
          background: '#18181b', // Zinc-900
          color: '#ffffff',
          border: '1px solid #27272a', // Zinc-800
          borderRadius: '0.5rem',
          zIndex: '9999',
          padding: '1rem',
          fontSize: '0.875rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        className: 'toast-custom relative',
        classNames: {
          toast: 'group toast-custom flex items-center gap-3 relative pr-8',
          success: 'toast-success',
          error: 'toast-error',
          warning: 'toast-warning',
          info: 'toast-info',
          closeButton: 'absolute top-1 right-1 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white transition-colors'
        },
        duration: 4000,
      }}
      closeButton
    >
      {/* Renderizado personalizado dentro del Toaster */}
    </Sonner>
  );
} 