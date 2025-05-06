"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

/**
 * Componente que muestra los planes de suscripción disponibles para el cliente
 */
export default function SubscriptionPlans() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isCheckoutSubdomain, setIsCheckoutSubdomain] = useState(false);
  
  useEffect(() => {
    // Verificar si estamos en el subdominio checkout.supatrades.app
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      setIsCheckoutSubdomain(host === 'checkout.supatrades.app');
    }
  }, []);
  
  const plans = [
    {
      id: 'plan_basico',
      name: 'Basic',
      priceMonthly: 4.99,
      priceAnnual: 49.99,
      features: [
        'Registro ilimitado de trades',
        'Análisis básico de rendimiento',
        'Exportación de datos básica',
        'Soporte por email'
      ],
      color: 'text-white',
      buttonClass: 'bg-white hover:bg-gray-200 text-black',
      checkIconClass: 'text-white',
      paddleMonthlyId: 'pdl_prod_basic_monthly',
      paddleAnnualId: 'pdl_prod_basic_annual',
    },
    {
      id: 'plan_standard',
      name: 'Standard',
      priceMonthly: 9.99,
      priceAnnual: 99.99,
      features: [
        'Todo lo del Plan Basic',
        'Análisis avanzado de métricas',
        'Reportes semanales de rendimiento',
        'Exportación personalizada',
        'Soporte prioritario'
      ],
      color: 'text-[#00A3FF]',
      buttonClass: 'bg-[#00A3FF] hover:bg-[#0084D1] text-white',
      checkIconClass: 'text-[#00A3FF]',
      paddleMonthlyId: 'pdl_prod_standard_monthly',
      paddleAnnualId: 'pdl_prod_standard_annual',
    },
    {
      id: 'plan_premium',
      name: 'Supa Premium',
      priceMonthly: 14.99,
      priceAnnual: 149.99,
      features: [
        'Todo lo del Plan Standard',
        'Análisis predictivo de trading',
        'Integración con plataformas de trading',
        'Reportes personalizados avanzados',
        'Acceso a webinars exclusivos',
        'Soporte 24/7'
      ],
      color: 'text-[#A855F7]',
      buttonClass: 'bg-gradient-to-r from-[#A855F7] to-[#E879F9] hover:opacity-90 text-white',
      checkIconClass: 'text-[#A855F7]',
      paddleMonthlyId: 'pdl_prod_premium_monthly',
      paddleAnnualId: 'pdl_prod_premium_annual',
    }
  ];

  const handleCheckout = (planId: string) => {
    // Implementar integración con Paddle para checkout
    console.log(`Iniciando checkout para plan ${planId}`);
    
    // Ejemplo de redirección a Paddle checkout
    const selectedPlan = plans.find(plan => plan.id === planId);
    
    if (selectedPlan) {
      const paddleId = billingCycle === 'monthly' 
        ? selectedPlan.paddleMonthlyId 
        : selectedPlan.paddleAnnualId;

      // Aquí iría la integración con Paddle para iniciar el checkout
      // window.location.href = `https://checkout.paddle.com/checkout/${paddleId}`;
      alert(`Redirigiendo a Paddle checkout para el plan ${selectedPlan.name} (${billingCycle})`);
    }
  };

  return (
    <div className="bg-black text-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Pricing</h2>
          <p className="text-xl mb-8">
            Analyze your trades with advanced tools.
          </p>
          
          <div className="inline-flex items-center bg-neutral-900 p-1 rounded-full mb-12 border border-gray-800">
            <Button
              variant="ghost"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-8 py-2 ${billingCycle === 'monthly' ? 'bg-neutral-800' : 'text-gray-400'}`}
            >
              Monthly
            </Button>
            <Button
              variant="ghost"
              onClick={() => setBillingCycle('annual')}
              className={`rounded-full px-8 py-2 flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-neutral-800' : 'text-gray-400'}`}
            >
              Annually
              {billingCycle === 'annual' && (
                <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded">-10%</span>
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className="bg-neutral-900 border border-gray-800 rounded-xl overflow-hidden transition-all hover:border-gray-700"
            >
              <CardHeader>
                <CardTitle className={`text-2xl font-bold ${plan.color}`}>{plan.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  Herramientas de trading para ti
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="mb-6">
                  <span className="text-5xl font-bold">
                    ${billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual}
                  </span>
                </div>
                <Button 
                  onClick={() => handleCheckout(plan.id)} 
                  className={`w-full py-6 rounded-lg font-semibold ${plan.buttonClass}`}
                >
                  Get started
                </Button>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className={`h-5 w-5 ${plan.checkIconClass} mr-2 shrink-0`} />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>
            Todos los planes incluyen una garantía de devolución de 14 días.
            <br />
            ¿Tienes preguntas? Consulta nuestras <a href={isCheckoutSubdomain ? "/faq" : "/checkout/faq"} className="text-[#00A3FF] hover:underline">Preguntas Frecuentes</a>
          </p>
        </div>
      </div>
    </div>
  );
}