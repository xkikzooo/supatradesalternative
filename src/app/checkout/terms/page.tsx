import React from 'react';
import CheckoutHeader from '@/components/checkout/header';
import CheckoutFooter from '@/components/checkout/footer';
import PaddleVerificationTag from '@/components/checkout/verification-tag';

export const metadata = {
  title: 'SupaTrades - Términos de Servicio',
  description: 'Términos y condiciones para el uso de SupaTrades',
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <PaddleVerificationTag />
      <CheckoutHeader />
      
      <main className="flex-grow container mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-3 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Términos de Servicio</h1>
        <p className="text-gray-400 text-center text-lg mb-12 max-w-2xl mx-auto">
          Condiciones que rigen el uso de nuestra plataforma.
        </p>
        
        <div className="max-w-3xl mx-auto bg-neutral-900 border border-gray-800 rounded-xl p-8">
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-gray-400">Última actualización: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Introducción</h2>
            <p className="text-gray-300 leading-relaxed">
              Bienvenido a SupaTrades. Estos Términos de Servicio rigen tu uso de nuestra plataforma web 
              y aplicación, incluida cualquier funcionalidad, API o herramienta asociada (colectivamente, el "Servicio").
            </p>
            <p className="text-gray-300 leading-relaxed">
              Al acceder o utilizar nuestro Servicio, aceptas cumplir y quedar vinculado por estos Términos. 
              Si no estás de acuerdo con estos Términos, no debes acceder ni utilizar nuestro Servicio.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Descripción del Servicio</h2>
            <p className="text-gray-300 leading-relaxed">
              SupaTrades es una plataforma diseñada para ayudar a los traders a registrar, analizar y mejorar 
              su rendimiento de trading. Proporcionamos herramientas para el seguimiento de operaciones, 
              análisis de resultados y gestión de cuentas de trading.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Cuentas y Registro</h2>
            <p className="text-gray-300 leading-relaxed">
              Para utilizar algunas funciones de nuestro Servicio, debes crear una cuenta. Al registrarte, 
              aceptas proporcionar información precisa, actual y completa. Eres responsable de mantener 
              la confidencialidad de tu contraseña y de todas las actividades que ocurran en tu cuenta.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Suscripciones y Pagos</h2>
            <p className="text-gray-300 leading-relaxed">
              Ofrecemos diferentes planes de suscripción para acceder a las funcionalidades de SupaTrades. 
              Los detalles de los planes, precios y funcionalidades están disponibles en nuestra página de planes.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Al suscribirte a un plan, aceptas pagar todas las tarifas aplicables según los términos de 
              facturación vigentes. Los pagos se procesan a través de Paddle, nuestro procesador de pagos externo.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Las suscripciones se renuevan automáticamente al final de cada período de facturación, a menos 
              que canceles tu suscripción antes del próximo ciclo de facturación.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Cancelaciones y Reembolsos</h2>
            <p className="text-gray-300 leading-relaxed">
              Puedes cancelar tu suscripción en cualquier momento desde tu cuenta. La cancelación se hará 
              efectiva al final del período de facturación actual.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Ofrecemos una garantía de devolución de 14 días para nuevas suscripciones. Consulta nuestra 
              <a href="/checkout/refund" className="text-[#00A3FF] hover:underline"> Política de Reembolso</a> para obtener más detalles.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Uso Aceptable</h2>
            <p className="text-gray-300 leading-relaxed">
              Al utilizar nuestro Servicio, aceptas no:
            </p>
            <ul className="list-disc pl-5 text-gray-300 leading-relaxed space-y-2">
              <li>Violar leyes o regulaciones aplicables</li>
              <li>Infringir nuestros derechos o los derechos de terceros</li>
              <li>Manipular, interferir o interrumpir el acceso a nuestro Servicio</li>
              <li>Realizar ingeniería inversa o intentar acceder al código fuente de nuestro Servicio</li>
              <li>Utilizar nuestro Servicio para actividades ilegales o no autorizadas</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Propiedad Intelectual</h2>
            <p className="text-gray-300 leading-relaxed">
              Todos los derechos, títulos e intereses en y para el Servicio, incluidos todos los derechos 
              de propiedad intelectual, son y seguirán siendo propiedad exclusiva de SupaTrades y sus licenciantes.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Limitación de Responsabilidad</h2>
            <p className="text-gray-300 leading-relaxed">
              En ningún caso SupaTrades será responsable por daños indirectos, incidentales, especiales, 
              consecuentes o punitivos, incluidos pérdida de beneficios, pérdida de datos u otras pérdidas 
              intangibles, que resulten del uso o la imposibilidad de usar el Servicio.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Modificaciones al Servicio y los Términos</h2>
            <p className="text-gray-300 leading-relaxed">
              Nos reservamos el derecho de modificar o discontinuar, temporal o permanentemente, el Servicio, 
              o cualquier característica o parte del mismo, con o sin previo aviso.
            </p>
            <p className="text-gray-300 leading-relaxed">
              También podemos modificar estos Términos de vez en cuando. Si hacemos cambios, te informaremos 
              publicando el nuevo texto en esta página y/o notificándote por correo electrónico.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Ley Aplicable</h2>
            <p className="text-gray-300 leading-relaxed">
              Estos Términos se regirán e interpretarán de acuerdo con las leyes de España, sin tener en cuenta 
              sus disposiciones sobre conflictos de leyes.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Contacto</h2>
            <p className="text-gray-300 leading-relaxed">
              Si tienes alguna pregunta sobre estos Términos, contáctanos en 
              <a href="mailto:soporte@supatrades.app" className="text-[#00A3FF] hover:underline"> soporte@supatrades.app</a>.
            </p>
          </div>
        </div>
      </main>
      
      <CheckoutFooter />
    </div>
  );
} 