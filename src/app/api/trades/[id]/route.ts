import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const {
      tradingPairId,
      direction,
      bias,
      biasExplanation,
      psychology,
      result,
      pnl,
      riskAmount,
      images,
      date,
      accountId,
    } = await req.json();

    // Validaciones
    if (!tradingPairId) {
      return NextResponse.json(
        { error: 'El par de trading es requerido' },
        { status: 400 }
      );
    }

    if (!direction || !['LONG', 'SHORT'].includes(direction)) {
      return NextResponse.json(
        { error: 'La dirección debe ser LONG o SHORT' },
        { status: 400 }
      );
    }

    if (!bias || !['BULLISH', 'BEARISH', 'NEUTRAL'].includes(bias)) {
      return NextResponse.json(
        { error: 'El bias debe ser BULLISH, BEARISH o NEUTRAL' },
        { status: 400 }
      );
    }

    if (!result || !['WIN', 'LOSS', 'BREAKEVEN'].includes(result)) {
      return NextResponse.json(
        { error: 'El resultado debe ser WIN, LOSS o BREAKEVEN' },
        { status: 400 }
      );
    }

    if (typeof pnl !== 'number' || isNaN(pnl)) {
      return NextResponse.json(
        { error: 'El PnL debe ser un número válido' },
        { status: 400 }
      );
    }

    // Verificar que el trade existe y pertenece al usuario
    const existingTrade = await prisma.trade.findFirst({
      where: {
        id: params.id,
        account: {
          userId: session.user.id
        }
      },
      include: {
        account: true,
      },
    });

    if (!existingTrade) {
      return NextResponse.json(
        { error: 'Trade no encontrado o no autorizado' },
        { status: 404 }
      );
    }

    // Verificar que el trading pair existe
    const tradingPair = await prisma.tradingPair.findFirst({
      where: {
        id: tradingPairId,
      },
    });

    if (!tradingPair) {
      return NextResponse.json(
        { error: 'Par de trading no encontrado' },
        { status: 404 }
      );
    }

    // Usar transacción para garantizar atomicidad en la operación
    const updatedTrade = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Si el trade ya existía, revertir su impacto en la cuenta anterior
      if (existingTrade.accountId) {
        const oldPnl = existingTrade.pnl;
        const oldResult = existingTrade.result;
        
        await tx.tradingAccount.update({
          where: {
            id: existingTrade.accountId,
          },
          data: {
            balance: {
              increment: oldResult === 'LOSS' ? Math.abs(oldPnl) : -oldPnl,
            },
          },
        });
      }

      // 2. Actualizar el balance de la cuenta específica seleccionada para este trade
      if (accountId) {
        const pnlValue = result === 'LOSS' ? -Math.abs(Number(pnl)) : Number(pnl);
        await tx.tradingAccount.update({
          where: {
            id: accountId,
          },
          data: {
            balance: {
              increment: pnlValue,
            },
          },
        });
      }

      // 3. Actualizar el trade
      return await tx.trade.update({
        where: {
          id: params.id,
        },
        data: {
          tradingPairId,
          direction,
          bias,
          biasExplanation,
          psychology,
          result,
          pnl: result === 'LOSS' ? -Math.abs(Number(pnl)) : Number(pnl),
          riskAmount,
          images: images || [],
          date: new Date(date),
          accountId,
        },
        include: {
          tradingPair: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    return NextResponse.json(updatedTrade);
  } catch (error) {
    console.error('Error al actualizar trade:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el trade' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que el trade existe y pertenece al usuario
    const trade = await prisma.trade.findFirst({
      where: {
        id: params.id,
        account: {
          userId: session.user.id
        }
      },
      include: {
        account: true,
      },
    });

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade no encontrado o no autorizado' },
        { status: 404 }
      );
    }

    // Usar transacción para revertir el PnL y eliminar el trade de forma atómica
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Revertir el PnL de la cuenta específica
      if (trade.accountId) {
        await tx.tradingAccount.update({
          where: {
            id: trade.accountId,
          },
          data: {
            balance: {
              increment: trade.result === 'LOSS' ? Math.abs(trade.pnl) : -trade.pnl,
            },
          },
        });
      }

      // 2. Eliminar el trade
      await tx.trade.delete({
        where: {
          id: params.id,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar trade:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el trade' },
      { status: 500 }
    );
  }
} 