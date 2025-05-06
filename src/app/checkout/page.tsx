import React from 'react';
import CheckoutHeader from '@/components/checkout/header';
import CheckoutFooter from '@/components/checkout/footer';
import SubscriptionPlans from '@/components/checkout/plans';
import PaddleVerificationTag from '@/components/checkout/verification-tag';

export const metadata = {
  title: 'SupaTrades - Planes de Suscripción',
  description: 'Elige el plan de suscripción que mejor se adapte a tus necesidades de trading',
};

export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <PaddleVerificationTag />
      <CheckoutHeader />
      
      <main className="flex-grow">
        <SubscriptionPlans />
      </main>
      
      <CheckoutFooter />
    </div>
  );
} 