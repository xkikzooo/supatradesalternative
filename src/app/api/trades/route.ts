import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await req.json();
    console.log('Datos recibidos:', data);
    
    if (!data.tradingPairId || !data.date || data.pnl === undefined || !data.accountId) {
      console.log('Campos faltantes:', {
        tradingPairId: !data.tradingPairId,
        date: !data.date,
        pnl: data.pnl === undefined,
        accountId: !data.accountId
      });
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el trading pair existe y pertenece al usuario
    const tradingPair = await prisma.tradingPair.findFirst({
      where: {
        id: data.tradingPairId,
      },
    });

    if (!tradingPair) {
      console.log('Trading pair no encontrado:', {
        tradingPairId: data.tradingPairId
      });
      return NextResponse.json(
        { error: 'Par de trading no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que la cuenta existe y pertenece al usuario
    const account = await prisma.tradingAccount.findFirst({
      where: {
        id: data.accountId,
        userId: session.user.id,
      },
    });

    if (!account) {
      console.log('Cuenta no encontrada o no autorizada:', {
        accountId: data.accountId
      });
      return NextResponse.json(
        { error: 'Cuenta no encontrada o no autorizada' },
        { status: 404 }
      );
    }

    // Preparar los datos para la creación
    const tradeData = {
      tradingPairId: data.tradingPairId,
      direction: data.direction || 'LONG',
      bias: data.bias || 'NEUTRAL',
      biasExplanation: data.biasExplanation || '',
      psychology: data.psychology || '',
      result: data.result || 'BREAKEVEN',
      pnl: data.result === 'LOSS' ? -Math.abs(Number(data.pnl) || 0) : Number(data.pnl) || 0,
      riskAmount: data.riskAmount ? Number(data.riskAmount) : null,
      images: Array.isArray(data.images) ? data.images : [],
      date: new Date(data.date),
      userId: session.user.id,
      accountId: data.accountId,
    };

    // Validar que los valores de los enums sean válidos
    if (!['LONG', 'SHORT'].includes(tradeData.direction)) {
      return NextResponse.json(
        { error: 'Dirección de trade inválida' },
        { status: 400 }
      );
    }

    if (tradeData.bias && !['BULLISH', 'BEARISH', 'NEUTRAL'].includes(tradeData.bias)) {
      return NextResponse.json(
        { error: 'Bias inválido' },
        { status: 400 }
      );
    }

    if (!['WIN', 'LOSS', 'BREAKEVEN'].includes(tradeData.result)) {
      return NextResponse.json(
        { error: 'Resultado inválido' },
        { status: 400 }
      );
    }

    console.log('Datos a insertar:', tradeData);

    const trade = await prisma.trade.create({
      data: tradeData,
      include: {
        tradingPair: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Actualizar el balance de la cuenta
    if (data.accountId) {
      await prisma.tradingAccount.update({
        where: {
          id: data.accountId,
        },
        data: {
          balance: {
            increment: data.result === 'LOSS' ? -Math.abs(Number(data.pnl)) : Number(data.pnl),
          },
        },
      });
    }

    console.log('Trade creado:', trade);
    return NextResponse.json(trade);
  } catch (err: any) {
    // Log detallado del error
    const errorDetails = {
      message: err?.message || 'Error desconocido',
      name: err?.name || 'Error',
      stack: err?.stack || '',
      cause: err?.cause || null
    };
    
    console.error('Error detallado al crear trade:', errorDetails);

    // Si es un error de Prisma, dar un mensaje más específico
    if (err?.name === 'PrismaClientKnownRequestError') {
      // Error de clave foránea
      if (err.code === 'P2003') {
        return NextResponse.json(
          { error: 'Error de referencia: Uno de los campos referenciados no existe' },
          { status: 400 }
        );
      }
      
      // Error de validación
      if (err.code === 'P2002') {
        return NextResponse.json(
          { error: 'Error de validación: Ya existe un registro con estos datos' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Error de validación en los datos del trade: ' + err.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor: ' + errorDetails.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const trades = await prisma.trade.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        tradingPair: {
          select: {
            id: true,
            name: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
            broker: true,
            type: true,
            initialBalance: true,
          },
        },
      },
    });

    return NextResponse.json(trades);
  } catch (error) {
    console.error('Error al obtener trades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 