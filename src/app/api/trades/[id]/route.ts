import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

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

    // Verificar que el trading pair existe y pertenece al usuario
    const tradingPair = await prisma.tradingPair.findFirst({
      where: {
        id: tradingPairId,
      },
    });

    if (!tradingPair) {
      return NextResponse.json(
        { error: 'Par de trading no encontrado o no autorizado' },
        { status: 404 }
      );
    }

    // Si el trade ya existía, revertir su impacto en el balance
    if (existingTrade) {
      const oldPnl = existingTrade.pnl;
      const oldResult = existingTrade.result;
      
      // Revertir el impacto del trade anterior
      if (existingTrade.accountId) {
        await prisma.tradingAccount.update({
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
    }

    // Actualizar el balance con el nuevo PnL
    if (accountId) {
      await prisma.tradingAccount.update({
        where: {
          id: accountId,
        },
        data: {
          balance: {
            increment: result === 'LOSS' ? -Math.abs(Number(pnl)) : Number(pnl),
          },
        },
      });
    }

    const updatedTrade = await prisma.trade.update({
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

    // Revertir el PnL de la cuenta
    if (trade.accountId && trade.account) {
      await prisma.tradingAccount.update({
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

    await prisma.trade.delete({
      where: {
        id: params.id,
      },
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