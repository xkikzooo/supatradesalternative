import React from 'react';
import CheckoutHeader from '@/components/checkout/header';
import CheckoutFooter from '@/components/checkout/footer';
import PaddleVerificationTag from '@/components/checkout/verification-tag';

export const metadata = {
  title: 'SupaTrades - Preguntas Frecuentes',
  description: 'Respuestas a las preguntas más comunes sobre SupaTrades',
};

export default function FAQPage() {
  const faqs = [
    {
      question: '¿Qué es SupaTrades?',
      answer: 'SupaTrades es una plataforma para traders que permite registrar, analizar y mejorar tu rendimiento. Te ayuda a identificar patrones en tus trades, analizar tus métricas de rendimiento y tomar mejores decisiones basadas en datos.'
    },
    {
      question: '¿Cómo funciona la suscripción?',
      answer: 'Ofrecemos planes mensuales y anuales. Al suscribirte, obtendrás acceso inmediato a todas las funciones de la plataforma. Las suscripciones se renuevan automáticamente, pero puedes cancelar en cualquier momento desde tu panel de usuario.'
    },
    {
      question: '¿Puedo cambiar de plan?',
      answer: 'Sí, puedes actualizar o cambiar tu plan en cualquier momento. Si actualizas, se te cobrará la diferencia prorrateada. Si cambias a un plan inferior, el cambio se aplicará en tu próximo ciclo de facturación.'
    },
    {
      question: '¿Cuál es la política de reembolso?',
      answer: 'Ofrecemos una garantía de devolución de 14 días. Si no estás satisfecho con el servicio, puedes solicitar un reembolso dentro de los primeros 14 días de tu suscripción. Consulta nuestra política de reembolso para más detalles.'
    },
    {
      question: '¿Cómo puedo cancelar mi suscripción?',
      answer: 'Puedes cancelar tu suscripción en cualquier momento desde tu perfil en la sección "Suscripción". La cancelación se hará efectiva al final de tu período de facturación actual.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express) y PayPal. Todos los pagos son procesados de forma segura a través de Paddle.'
    },
    {
      question: '¿Mis datos están seguros?',
      answer: 'Sí, la seguridad de tus datos es nuestra prioridad. Utilizamos encriptación SSL, almacenamos los datos de forma segura y nunca compartimos tu información con terceros sin tu consentimiento. Consulta nuestra política de privacidad para más detalles.'
    },
    {
      question: '¿Ofrecen soporte técnico?',
      answer: 'Sí, ofrecemos soporte técnico por correo electrónico para todos nuestros usuarios. Los usuarios con plan Pro tienen acceso a soporte prioritario.'
    },
    {
      question: '¿Puedo exportar mis datos?',
      answer: 'Sí, todos los planes incluyen la posibilidad de exportar tus datos de trading en formatos CSV y Excel para análisis adicionales o copia de seguridad.'
    },
    {
      question: '¿Tienen una aplicación móvil?',
      answer: 'Actualmente, SupaTrades es una aplicación web optimizada para dispositivos móviles. Estamos trabajando en el desarrollo de aplicaciones nativas para iOS y Android.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <PaddleVerificationTag />
      <CheckoutHeader />
      
      <main className="flex-grow container mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-3 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Preguntas Frecuentes</h1>
        <p className="text-gray-400 text-center text-lg mb-12 max-w-2xl mx-auto">
          Encuentra respuestas a las preguntas más comunes sobre nuestra plataforma.
        </p>
        
        <div className="max-w-3xl mx-auto">
          <div className="space-y-5">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-neutral-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-white">{faq.question}</h3>
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-gray-400">
              ¿No encuentras la respuesta que buscas? Contáctanos en{' '}
              <a href="mailto:soporte@supatrades.app" className="text-[#00A3FF] hover:underline">
                soporte@supatrades.app
              </a>
            </p>
          </div>
        </div>
      </main>
      
      <CheckoutFooter />
    </div>
  );
} 