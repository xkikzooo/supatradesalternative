import React from 'react';

/**
 * Componente para la verificación de dominio de Paddle
 * 
 * Este componente añade la etiqueta de verificación requerida por Paddle
 * para confirmar que el dominio es propiedad del vendedor.
 */
export default function PaddleVerificationTag() {
  return (
    <div className="hidden">
      {/* Paddle Domain Verification */}
      <meta name="paddle-domain-verification" content="your-paddle-verification-code" />
    </div>
  );
} 