'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  AlertTriangle, 
  AlertOctagon, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle, 
  X 
} from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  cancelText?: string;
  confirmText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  cancelText = "Cancelar",
  confirmText = "Confirmar",
  type = "warning"
}: ConfirmDialogProps) {
  // Determinar el icono y colores basados en el tipo
  let icon = <AlertTriangle className="h-6 w-6 text-yellow-500" />;
  let confirmButtonClass = "bg-yellow-600 text-zinc-100 hover:bg-yellow-700";
  
  switch (type) {
    case 'danger':
      icon = <AlertOctagon className="h-6 w-6 text-red-500" />;
      confirmButtonClass = "bg-red-600 text-zinc-100 hover:bg-red-700";
      break;
    case 'info':
      icon = <HelpCircle className="h-6 w-6 text-blue-500" />;
      confirmButtonClass = "bg-blue-600 text-zinc-100 hover:bg-blue-700";
      break;
    case 'success':
      icon = <CheckCircle className="h-6 w-6 text-green-500" />;
      confirmButtonClass = "bg-green-600 text-zinc-100 hover:bg-green-700";
      break;
    default:
      break;
  }
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-zinc-900 border border-zinc-800 shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-zinc-100 flex items-center gap-2">
            {icon}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            className={`${confirmButtonClass} flex items-center gap-1`}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {type === 'success' ? <CheckCircle className="h-4 w-4" /> : 
             type === 'danger' ? <AlertOctagon className="h-4 w-4" /> : 
             <AlertTriangle className="h-4 w-4" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 