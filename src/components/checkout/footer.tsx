"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Componente de pie de página para las páginas de checkout
 */
export default function CheckoutFooter() {
  const currentYear = new Date().getFullYear();
  const [isCheckoutSubdomain, setIsCheckoutSubdomain] = useState(false);
  
  useEffect(() => {
    // Verificar si estamos en el subdominio checkout.supatrades.app
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      setIsCheckoutSubdomain(host === 'checkout.supatrades.app');
    }
  }, []);

  return (
    <footer className="border-t border-gray-800 bg-black text-white mt-auto">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">SupaTrades</h3>
            <p className="text-gray-400 text-sm">
              Plataforma de seguimiento y análisis de trading diseñada para 
              ayudarte a mejorar tu rendimiento y tomar mejores decisiones.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Enlaces</h3>
            <ul className="space-y-3">
              <li>
                <Link href={isCheckoutSubdomain ? "/" : "/checkout"} className="text-sm text-gray-400 hover:text-[#00A3FF] transition-colors">
                  Planes de Suscripción
                </Link>
              </li>
              <li>
                <Link href={isCheckoutSubdomain ? "/faq" : "/checkout/faq"} className="text-sm text-gray-400 hover:text-[#00A3FF] transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href={isCheckoutSubdomain ? "/terms" : "/checkout/terms"} className="text-sm text-gray-400 hover:text-[#00A3FF] transition-colors">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link href={isCheckoutSubdomain ? "/privacy" : "/checkout/privacy"} className="text-sm text-gray-400 hover:text-[#00A3FF] transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href={isCheckoutSubdomain ? "/refund" : "/checkout/refund"} className="text-sm text-gray-400 hover:text-[#00A3FF] transition-colors">
                  Política de Reembolso
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Contacto</h3>
            <ul className="space-y-3">
              <li className="text-sm text-gray-400">
                Email: soporte@supatrades.app
              </li>
              <li className="text-sm text-gray-400">
                Horario: Lunes a Viernes, 9:00 - 18:00 CET
              </li>
            </ul>
            
            <div className="mt-6 flex space-x-4">
              {/* Añadir enlaces a redes sociales si es necesario */}
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} SupaTrades. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Pagos procesados de forma segura a través de Paddle.
          </p>
        </div>
      </div>
    </footer>
  );
} 