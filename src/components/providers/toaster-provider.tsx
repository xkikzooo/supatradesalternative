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
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          backdropFilter: 'blur(12px)',
          zIndex: '9999',
          padding: '16px',
          fontSize: '14px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        },
        className: 'toast-custom relative',
        classNames: {
          toast: 'group toast-custom flex items-center gap-3 relative pr-8',
          success: 'toast-success bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
          error: 'toast-error bg-red-500/10 border-red-500/20 text-red-300',
          warning: 'toast-warning bg-amber-500/10 border-amber-500/20 text-amber-300',
          info: 'toast-info bg-blue-500/10 border-blue-500/20 text-blue-300',
          closeButton: 'absolute top-2 right-2 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all duration-200'
        },
        duration: 4000,
      }}
      closeButton
    >
      {/* Renderizado personalizado dentro del Toaster */}
    </Sonner>
  );
} 