import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const account = await prisma.tradingAccount.findUnique({
      where: {
        id: params.accountId,
      },
    });

    if (!account) {
      return new NextResponse('Cuenta no encontrada', { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('[ACCOUNT_GET]', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, balance, initialBalance, broker, type, currency, riskPerTrade } = body;

    // Verificar que la cuenta pertenece al usuario
    const existingAccount = await prisma.tradingAccount.findUnique({
      where: {
        id: params.accountId,
      },
    });

    if (!existingAccount || existingAccount.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada' },
        { status: 404 }
      );
    }

    const account = await prisma.tradingAccount.update({
      where: {
        id: params.accountId,
      },
      data: {
        name,
        balance,
        initialBalance,
        broker,
        type,
        currency,
        riskPerTrade,
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error al actualizar cuenta:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la cuenta' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que la cuenta pertenece al usuario
    const existingAccount = await prisma.tradingAccount.findUnique({
      where: {
        id: params.accountId,
      },
    });

    if (!existingAccount || existingAccount.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada' },
        { status: 404 }
      );
    }

    await prisma.tradingAccount.delete({
      where: {
        id: params.accountId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la cuenta' },
      { status: 500 }
    );
  }
} 