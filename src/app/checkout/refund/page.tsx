import React from 'react';
import CheckoutHeader from '@/components/checkout/header';
import CheckoutFooter from '@/components/checkout/footer';
import PaddleVerificationTag from '@/components/checkout/verification-tag';

export const metadata = {
  title: 'SupaTrades - Política de Reembolso',
  description: 'Política de reembolso y devoluciones de SupaTrades',
};

export default function RefundPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <PaddleVerificationTag />
      <CheckoutHeader />
      
      <main className="flex-grow container mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-3 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Política de Reembolso</h1>
        <p className="text-gray-400 text-center text-lg mb-12 max-w-2xl mx-auto">
          Información sobre nuestros términos de devolución.
        </p>
        
        <div className="max-w-3xl mx-auto bg-neutral-900 border border-gray-800 rounded-xl p-8">
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-gray-400">Última actualización: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Garantía de Devolución</h2>
            <p className="text-gray-300 leading-relaxed">
              En SupaTrades, ofrecemos una garantía de devolución de 14 días para todas las nuevas suscripciones. 
              Si no estás completamente satisfecho con nuestro servicio, puedes solicitar un reembolso completo 
              dentro de los primeros 14 días desde la fecha de tu suscripción inicial.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Elegibilidad para Reembolsos</h2>
            <p className="text-gray-300 leading-relaxed">Para ser elegible para un reembolso:</p>
            <ul className="list-disc pl-5 text-gray-300 leading-relaxed space-y-2">
              <li>La solicitud debe realizarse dentro del período de 14 días desde la fecha de suscripción inicial.</li>
              <li>Para renovaciones automáticas, solo se puede solicitar un reembolso dentro de los 7 días posteriores a la fecha de renovación.</li>
              <li>La cuenta debe estar en buen estado (no suspendida por violación de los términos de servicio).</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Cómo Solicitar un Reembolso</h2>
            <p className="text-gray-300 leading-relaxed">Puedes solicitar un reembolso de las siguientes maneras:</p>
            <ul className="list-disc pl-5 text-gray-300 leading-relaxed space-y-2">
              <li>
                <strong className="text-white">Correo electrónico:</strong> Envía tu solicitud a <a href="mailto:soporte@supatrades.app" className="text-[#00A3FF] hover:underline">soporte@supatrades.app</a> incluyendo tu 
                dirección de correo electrónico de registro y el motivo de la solicitud.
              </li>
              <li>
                <strong className="text-white">Desde tu cuenta:</strong> Navega a la sección de "Suscripción" en tu perfil y selecciona 
                la opción "Solicitar reembolso".
              </li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Procesaremos tu solicitud dentro de 2-3 días hábiles y te notificaremos por correo electrónico 
              cuando el reembolso haya sido procesado.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Reembolsos por Renovación Automática</h2>
            <p className="text-gray-300 leading-relaxed">
              Si olvidaste cancelar tu suscripción y se renovó automáticamente, ofrecemos un período de cortesía 
              de 7 días para solicitar un reembolso. Después de este período, no podremos procesar un reembolso 
              por renovación automática.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Métodos de Reembolso</h2>
            <p className="text-gray-300 leading-relaxed">
              Los reembolsos se procesarán utilizando el mismo método de pago utilizado para la compra original. 
              Dependiendo de tu banco o tarjeta de crédito, el tiempo para que el reembolso aparezca en tu estado 
              de cuenta puede variar (generalmente entre 5-10 días hábiles).
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Reembolsos Parciales</h2>
            <p className="text-gray-300 leading-relaxed">
              No ofrecemos reembolsos parciales o prorrateados por el tiempo no utilizado de tu suscripción fuera 
              del período de garantía de devolución. Si cancelas tu suscripción después del período de garantía, 
              seguirás teniendo acceso al servicio hasta el final del período de facturación actual.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Exclusiones</h2>
            <p className="text-gray-300 leading-relaxed">No ofrecemos reembolsos en los siguientes casos:</p>
            <ul className="list-disc pl-5 text-gray-300 leading-relaxed space-y-2">
              <li>Después del período de garantía de devolución (14 días para nuevas suscripciones, 7 días para renovaciones).</li>
              <li>Si la cuenta ha sido suspendida por violación de nuestros términos de servicio.</li>
              <li>Si ya has recibido un reembolso anterior para la misma cuenta.</li>
              <li>Si has utilizado intensivamente las características del servicio durante el período de garantía.</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Circunstancias Excepcionales</h2>
            <p className="text-gray-300 leading-relaxed">
              En casos de problemas técnicos graves que impidan el uso del servicio, o circunstancias atenuantes 
              personales, podemos considerar reembolsos fuera de esta política caso por caso. Estas decisiones 
              son a discreción exclusiva de SupaTrades.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Cambios a esta Política</h2>
            <p className="text-gray-300 leading-relaxed">
              Nos reservamos el derecho de modificar esta política de reembolso en cualquier momento. Cualquier 
              cambio será efectivo inmediatamente después de su publicación en nuestro sitio web. Los cambios no 
              se aplicarán retroactivamente a transacciones realizadas antes de la modificación de la política.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Contacto</h2>
            <p className="text-gray-300 leading-relaxed">
              Si tienes preguntas sobre nuestra política de reembolso, contáctanos en <a href="mailto:soporte@supatrades.app" className="text-[#00A3FF] hover:underline">soporte@supatrades.app</a>.
            </p>
          </div>
        </div>
      </main>
      
      <CheckoutFooter />
    </div>
  );
}