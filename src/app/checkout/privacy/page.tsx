import React from 'react';
import CheckoutHeader from '@/components/checkout/header';
import CheckoutFooter from '@/components/checkout/footer';
import PaddleVerificationTag from '@/components/checkout/verification-tag';

export const metadata = {
  title: 'SupaTrades - Política de Privacidad',
  description: 'Política de privacidad y protección de datos de SupaTrades',
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <PaddleVerificationTag />
      <CheckoutHeader />
      
      <main className="flex-grow container mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-3 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Política de Privacidad</h1>
        <p className="text-gray-400 text-center text-lg mb-12 max-w-2xl mx-auto">
          Cómo protegemos y utilizamos tu información personal.
        </p>
        
        <div className="max-w-3xl mx-auto bg-neutral-900 border border-gray-800 rounded-xl p-8">
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-gray-400">Última actualización: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Introducción</h2>
            <p className="text-gray-300 leading-relaxed">
              En SupaTrades, respetamos tu privacidad y nos comprometemos a proteger tus datos personales. 
              Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos la información 
              que nos proporcionas cuando utilizas nuestro servicio.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Información que Recopilamos</h2>
            <p className="text-gray-300 leading-relaxed">Podemos recopilar los siguientes tipos de información:</p>
            <ul className="list-disc pl-5 text-gray-300 leading-relaxed space-y-2">
              <li>
                <strong className="text-white">Información de cuenta:</strong> Cuando te registras, recopilamos tu nombre, dirección de 
                correo electrónico y contraseña.
              </li>
              <li>
                <strong className="text-white">Información de perfil:</strong> Puedes proporcionar información adicional como foto de 
                perfil e información de contacto.
              </li>
              <li>
                <strong className="text-white">Datos de uso:</strong> Información sobre cómo interactúas con nuestro servicio, incluidos 
                registros de trades, configuraciones y preferencias.
              </li>
              <li>
                <strong className="text-white">Información de pago:</strong> Cuando te suscribes a un plan de pago, nuestro procesador 
                de pagos (Paddle) recopila la información necesaria para procesar la transacción.
              </li>
              <li>
                <strong className="text-white">Cookies y tecnologías similares:</strong> Utilizamos cookies y tecnologías similares para 
                mejorar tu experiencia, analizar el uso del sitio y personalizar el contenido.
              </li>
            </ul>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Cómo Utilizamos tu Información</h2>
            <p className="text-gray-300 leading-relaxed">Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-5 text-gray-300 leading-relaxed space-y-2">
              <li>Proporcionar, mantener y mejorar nuestro servicio</li>
              <li>Procesar transacciones y enviar notificaciones relacionadas</li>
              <li>Responder a tus comentarios, preguntas y solicitudes</li>
              <li>Personalizar tu experiencia y proporcionar contenido relevante</li>
              <li>Monitorear y analizar tendencias, uso y actividades</li>
              <li>Detectar, prevenir y abordar problemas técnicos y de seguridad</li>
              <li>Cumplir con obligaciones legales y proteger nuestros derechos</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Compartición de Información</h2>
            <p className="text-gray-300 leading-relaxed">No vendemos ni compartimos tu información personal con terceros, excepto en las siguientes circunstancias:</p>
            <ul className="list-disc pl-5 text-gray-300 leading-relaxed space-y-2">
              <li>
                <strong className="text-white">Proveedores de servicios:</strong> Compartimos información con proveedores que nos ayudan a 
                proporcionar el servicio (como procesadores de pago, servicios de alojamiento web, etc.).
              </li>
              <li>
                <strong className="text-white">Cumplimiento legal:</strong> Podemos divulgar información si es razonablemente necesario para 
                cumplir con la ley, procesos legales o solicitudes gubernamentales.
              </li>
              <li>
                <strong className="text-white">Protección de derechos:</strong> Podemos divulgar información para proteger los derechos, 
                la propiedad o la seguridad de SupaTrades, nuestros usuarios u otros.
              </li>
            </ul>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Seguridad de Datos</h2>
            <p className="text-gray-300 leading-relaxed">
              Implementamos medidas de seguridad diseñadas para proteger tu información personal contra acceso 
              no autorizado, alteración, divulgación o destrucción. Estas medidas incluyen encriptación de datos, 
              firewalls, y acceso restringido a sistemas que contienen información personal.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Tus Derechos de Privacidad</h2>
            <p className="text-gray-300 leading-relaxed">Dependiendo de tu ubicación, puedes tener ciertos derechos relacionados con tus datos personales, como:</p>
            <ul className="list-disc pl-5 text-gray-300 leading-relaxed space-y-2">
              <li>Acceder a los datos personales que tenemos sobre ti</li>
              <li>Corregir datos inexactos o incompletos</li>
              <li>Eliminar tus datos personales</li>
              <li>Oponerte al procesamiento de tus datos</li>
              <li>Recibir una copia de tus datos en un formato estructurado</li>
              <li>Retirar tu consentimiento en cualquier momento</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Para ejercer estos derechos, contáctanos a través de <a href="mailto:soporte@supatrades.app" className="text-[#00A3FF] hover:underline">soporte@supatrades.app</a>.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Retención de Datos</h2>
            <p className="text-gray-300 leading-relaxed">
              Conservamos tu información personal solo durante el tiempo necesario para los fines establecidos 
              en esta Política de Privacidad, a menos que se requiera o permita un período de retención más largo 
              por ley.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Transferencias Internacionales de Datos</h2>
            <p className="text-gray-300 leading-relaxed">
              Tu información puede ser transferida y procesada en países distintos a tu país de residencia, 
              donde pueden existir diferentes leyes de protección de datos. Cuando transferimos datos internacionalmente, 
              tomamos medidas para garantizar que la información reciba un nivel adecuado de protección.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Niños</h2>
            <p className="text-gray-300 leading-relaxed">
              Nuestro servicio no está dirigido a personas menores de 18 años. No recopilamos a sabiendas 
              información personal de niños menores de 18 años. Si eres padre o tutor y crees que tu hijo 
              nos ha proporcionado información personal, contáctanos.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Cambios a esta Política</h2>
            <p className="text-gray-300 leading-relaxed">
              Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos cualquier 
              cambio publicando la nueva Política de Privacidad en esta página y/o por correo electrónico.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Contacto</h2>
            <p className="text-gray-300 leading-relaxed">
              Si tienes preguntas sobre esta Política de Privacidad, contáctanos en <a href="mailto:soporte@supatrades.app" className="text-[#00A3FF] hover:underline">soporte@supatrades.app</a>.
            </p>
          </div>
        </div>
      </main>
      
      <CheckoutFooter />
    </div>
  );
} 