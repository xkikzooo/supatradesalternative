'use client';

import { useState } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  AlertOctagon,
  CheckCircle,
  Info
} from 'lucide-react';
import { Button } from './button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = 'danger',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  isLoading = false
}: ConfirmDeleteModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertOctagon className="h-6 w-6 text-red-400 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-amber-400" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-400" />;
      default:
        return <AlertOctagon className="h-6 w-6 text-red-400 animate-pulse" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-500/80 hover:bg-red-500 text-white';
      case 'warning':
        return 'bg-amber-500/80 hover:bg-amber-500 text-white';
      case 'info':
        return 'bg-blue-500/80 hover:bg-blue-500 text-white';
      default:
        return 'bg-red-500/80 hover:bg-red-500 text-white';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          {getIcon()}
          <h2 className="text-xl font-semibold text-white">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-auto text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
            disabled={isLoading || isConfirming}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-white/80 mb-6 leading-relaxed">
            {description}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading || isConfirming}
              className="flex-1 bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white rounded-xl transition-all duration-200"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading || isConfirming}
              className={`flex-1 rounded-xl transition-all duration-200 flex items-center gap-2 ${getConfirmButtonClass()}`}
            >
              {(isLoading || isConfirming) ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Procesando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {confirmText}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 