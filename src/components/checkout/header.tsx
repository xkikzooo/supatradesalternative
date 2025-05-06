"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

/**
 * Componente de cabecera para las páginas de checkout
 */
export default function CheckoutHeader() {
  const [isCheckoutSubdomain, setIsCheckoutSubdomain] = useState(false);
  
  useEffect(() => {
    // Verificar si estamos en el subdominio checkout.supatrades.app
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      setIsCheckoutSubdomain(host === 'checkout.supatrades.app');
    }
  }, []);

  return (
    <header className="border-b border-gray-800 bg-black text-white">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <Link href={isCheckoutSubdomain ? "/" : "/checkout"} className="flex items-center space-x-2">
          <Image 
            src="/supatrades.svg" 
            alt="SupaTrades Logo" 
            width={110} 
            height={30} 
            className="h-7 w-auto" 
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href={isCheckoutSubdomain ? "/" : "/checkout"} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Planes
          </Link>
          <Link href={isCheckoutSubdomain ? "/faq" : "/checkout/faq"} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            FAQ
          </Link>
          <Link href={isCheckoutSubdomain ? "/terms" : "/checkout/terms"} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Términos de Servicio
          </Link>
          <Link href={isCheckoutSubdomain ? "/privacy" : "/checkout/privacy"} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Privacidad
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600">
              Volver a la App
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
} 