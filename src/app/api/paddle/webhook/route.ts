import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Webhook de Paddle para recibir notificaciones sobre suscripciones,
 * renovaciones, cancelaciones y facturas.
 * 
 * Esta API se encarga de procesar eventos como:
 * - subscription.created
 * - subscription.updated
 * - subscription.canceled
 * - subscription.payment_succeeded
 * - subscription.payment_failed
 */
export async function POST(request: Request) {
  try {
    // Obtener los datos del webhook de Paddle
    const payload = await request.json();
    
    console.log('Webhook de Paddle recibido:', payload);
    
    // Verificar la autenticidad del webhook (implementar verificación de firma)
    // Este es un paso importante para la seguridad
    // En producción, debes verificar la firma utilizando el webhook_id y la clave secreta
    
    // Extraer tipo de evento y datos
    const eventType = payload.event_type;
    const data = payload.data;
    
    if (!eventType || !data) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }
    
    // Procesar el evento según su tipo
    switch (eventType) {
      case 'subscription.created':
        await handleSubscriptionCreated(data);
        break;
        
      case 'subscription.updated':
        await handleSubscriptionUpdated(data);
        break;
        
      case 'subscription.canceled':
        await handleSubscriptionCanceled(data);
        break;
        
      case 'subscription.payment_succeeded':
        await handlePaymentSucceeded(data);
        break;
        
      case 'subscription.payment_failed':
        await handlePaymentFailed(data);
        break;
        
      default:
        console.log(`Evento no manejado: ${eventType}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error procesando webhook de Paddle:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * Maneja la creación de una nueva suscripción
 */
async function handleSubscriptionCreated(data: any) {
  try {
    // Extraer datos relevantes
    const paddleSubscriptionId = data.subscription_id;
    const userEmail = data.customer.email;
    const planId = data.product.id;
    const planName = data.product.name;
    const statusRaw = data.status;
    
    // Mapear el estado de Paddle al estado en nuestra base de datos
    const status = mapPaddleStatus(statusRaw);
    
    // Buscar al usuario por email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      throw new Error(`Usuario no encontrado para email: ${userEmail}`);
    }
    
    // Crear la suscripción en la base de datos
    await prisma.subscription.create({
      data: {
        paddleId: paddleSubscriptionId,
        status,
        planId,
        planName,
        nextBillingDate: data.next_billed_at ? new Date(data.next_billed_at) : null,
        userId: user.id
      }
    });
    
    console.log(`Suscripción creada para usuario: ${user.id}`);
  } catch (error) {
    console.error('Error al procesar subscription.created:', error);
    throw error;
  }
}

/**
 * Maneja la actualización de una suscripción existente
 */
async function handleSubscriptionUpdated(data: any) {
  try {
    const paddleSubscriptionId = data.subscription_id;
    const statusRaw = data.status;
    const status = mapPaddleStatus(statusRaw);
    
    // Actualizar la suscripción en la base de datos
    await prisma.subscription.update({
      where: { paddleId: paddleSubscriptionId },
      data: {
        status,
        nextBillingDate: data.next_billed_at ? new Date(data.next_billed_at) : undefined,
        updatedAt: new Date()
      }
    });
    
    console.log(`Suscripción ${paddleSubscriptionId} actualizada a estado: ${status}`);
  } catch (error) {
    console.error('Error al procesar subscription.updated:', error);
    throw error;
  }
}

/**
 * Maneja la cancelación de una suscripción
 */
async function handleSubscriptionCanceled(data: any) {
  try {
    const paddleSubscriptionId = data.subscription_id;
    
    // Actualizar la suscripción en la base de datos
    await prisma.subscription.update({
      where: { paddleId: paddleSubscriptionId },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log(`Suscripción ${paddleSubscriptionId} cancelada`);
  } catch (error) {
    console.error('Error al procesar subscription.canceled:', error);
    throw error;
  }
}

/**
 * Maneja el pago exitoso de una suscripción
 */
async function handlePaymentSucceeded(data: any) {
  try {
    const paddleSubscriptionId = data.subscription_id;
    const paddleInvoiceId = data.invoice_id;
    const amount = data.amount;
    const currency = data.currency;
    
    // Buscar la suscripción
    const subscription = await prisma.subscription.findUnique({
      where: { paddleId: paddleSubscriptionId },
      include: { user: true }
    });
    
    if (!subscription) {
      throw new Error(`Suscripción no encontrada: ${paddleSubscriptionId}`);
    }
    
    // Crear una nueva factura
    await prisma.invoice.create({
      data: {
        paddleId: paddleInvoiceId,
        status: 'PAID',
        amount: parseFloat(amount),
        currency,
        paidAt: new Date(),
        subscriptionId: subscription.id,
        userId: subscription.userId
      }
    });
    
    console.log(`Pago exitoso para suscripción ${paddleSubscriptionId}`);
  } catch (error) {
    console.error('Error al procesar subscription.payment_succeeded:', error);
    throw error;
  }
}

/**
 * Maneja el fallo de pago de una suscripción
 */
async function handlePaymentFailed(data: any) {
  try {
    const paddleSubscriptionId = data.subscription_id;
    const paddleInvoiceId = data.invoice_id;
    const amount = data.amount;
    const currency = data.currency;
    
    // Buscar la suscripción
    const subscription = await prisma.subscription.findUnique({
      where: { paddleId: paddleSubscriptionId },
      include: { user: true }
    });
    
    if (!subscription) {
      throw new Error(`Suscripción no encontrada: ${paddleSubscriptionId}`);
    }
    
    // Crear una nueva factura fallida
    await prisma.invoice.create({
      data: {
        paddleId: paddleInvoiceId,
        status: 'UNPAID',
        amount: parseFloat(amount),
        currency,
        subscriptionId: subscription.id,
        userId: subscription.userId
      }
    });
    
    // Actualizar el estado de la suscripción si es necesario
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'PAST_DUE',
        updatedAt: new Date()
      }
    });
    
    console.log(`Pago fallido para suscripción ${paddleSubscriptionId}`);
  } catch (error) {
    console.error('Error al procesar subscription.payment_failed:', error);
    throw error;
  }
}

/**
 * Mapea los estados de Paddle a nuestros estados de suscripción
 */
function mapPaddleStatus(paddleStatus: string): 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'PAUSED' | 'CANCELED' {
  switch (paddleStatus.toLowerCase()) {
    case 'active':
      return 'ACTIVE';
    case 'trialing':
      return 'TRIALING';
    case 'past_due':
      return 'PAST_DUE';
    case 'paused':
      return 'PAUSED';
    case 'canceled':
    case 'cancelled':
      return 'CANCELED';
    default:
      console.warn(`Estado de Paddle desconocido: ${paddleStatus}, usando ACTIVE como valor predeterminado`);
      return 'ACTIVE';
  }
} 