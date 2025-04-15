import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/accounts - Obtener todas las cuentas del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const accounts = await prisma.tradingAccount.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        balance: true,
        initialBalance: true,
        broker: true,
        type: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
        riskPerTrade: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/accounts - Crear una nueva cuenta
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado: sesión de usuario inválida' },
        { status: 401 }
      );
    }

    const data = await req.json();
    console.log('Datos recibidos:', data);
    
    // Validar campos requeridos
    const requiredFields = ['name', 'initialBalance', 'balance', 'broker', 'type', 'currency'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos requeridos: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar que los valores numéricos sean válidos
    if (isNaN(parseFloat(data.balance)) || isNaN(parseFloat(data.initialBalance))) {
      return NextResponse.json(
        { error: 'Los valores de balance deben ser números válidos' },
        { status: 400 }
      );
    }

    // Validar el tipo de cuenta
    if (!['Challenge', 'Fondeada'].includes(data.type)) {
      return NextResponse.json(
        { error: 'El tipo de cuenta debe ser Challenge o Fondeada' },
        { status: 400 }
      );
    }

    // Validar la moneda
    if (!['USD', 'EUR'].includes(data.currency)) {
      return NextResponse.json(
        { error: 'La moneda debe ser USD o EUR' },
        { status: 400 }
      );
    }

    console.log('ID del usuario:', session.user.id);

    const account = await prisma.tradingAccount.create({
      data: {
        name: data.name,
        balance: parseFloat(data.balance),
        initialBalance: parseFloat(data.initialBalance),
        broker: data.broker,
        type: data.type,
        currency: data.currency,
        riskPerTrade: data.riskPerTrade || null,
        user: {
          connect: {
            id: session.user.id
          }
        }
      },
    });

    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Error al crear cuenta:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con ese nombre' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor: ' + (error.message || 'Error desconocido') },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await req.json();
    
    if (!data.id) {
      return NextResponse.json(
        { error: 'ID de cuenta requerido' },
        { status: 400 }
      );
    }

    // Verificar que la cuenta pertenece al usuario
    const existingAccount = await prisma.tradingAccount.findFirst({
      where: {
        id: data.id,
        userId: session.user.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada o no autorizada' },
        { status: 404 }
      );
    }

    const account = await prisma.tradingAccount.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        balance: data.balance,
        initialBalance: data.initialBalance,
        broker: data.broker,
        type: data.type,
        currency: data.currency,
        riskPerTrade: data.riskPerTrade,
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error al actualizar cuenta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de cuenta requerido' },
        { status: 400 }
      );
    }

    // Verificar que la cuenta pertenece al usuario
    const existingAccount = await prisma.tradingAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada o no autorizada' },
        { status: 404 }
      );
    }

    await prisma.tradingAccount.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 