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

    // Usar transacción para asegurar que tanto la creación del trade como la actualización 
    // del balance se realicen juntas, o ninguna se realice
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Crear el trade
      const trade = await tx.trade.create({
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

      // 2. Actualizar el balance de LA CUENTA ESPECÍFICA seleccionada
      if (data.accountId) {
        const pnlValue = data.result === 'LOSS' ? -Math.abs(Number(data.pnl)) : Number(data.pnl);
        await tx.tradingAccount.update({
          where: {
            id: data.accountId,
          },
          data: {
            balance: {
              increment: pnlValue,
            },
          },
        });
      }

      return trade;
    });

    console.log('Trade creado:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error al crear trade:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Obtener el accountId del parámetro de consulta si existe
    const url = new URL(req.url);
    const accountId = url.searchParams.get('accountId');
    
    // Construir la condición where
    const whereCondition: any = {
      userId: session.user.id,
    };
    
    // Si existe accountId, filtrar por esa cuenta específica
    if (accountId) {
      whereCondition.accountId = accountId;
    }

    const trades = await prisma.trade.findMany({
      where: whereCondition,
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