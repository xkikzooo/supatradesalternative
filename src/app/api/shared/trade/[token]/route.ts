import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    // Buscar el trade usando el token de compartir
    const shareRecord = await prisma.tradeShare.findUnique({
      where: {
        token: params.token
      },
      include: {
        trade: {
          include: {
            tradingPair: {
              select: {
                id: true,
                name: true
              }
            },
            account: {
              select: {
                id: true,
                name: true,
                broker: true,
                type: true
              }
            },
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!shareRecord) {
      return NextResponse.json(
        { error: 'Trade compartido no encontrado o el link ha expirado' },
        { status: 404 }
      );
    }

    // Remover información sensible del usuario
    const { trade } = shareRecord;
    const sharedTrade = {
      id: trade.id,
      tradingPair: trade.tradingPair,
      direction: trade.direction,
      bias: trade.bias,
      biasExplanation: trade.biasExplanation,
      psychology: trade.psychology,
      result: trade.result,
      pnl: trade.pnl,
      riskAmount: trade.riskAmount,
      images: trade.images,
      date: trade.date,
      account: {
        name: trade.account.name,
        broker: trade.account.broker,
        type: trade.account.type
      },
      trader: {
        name: trade.user.name
      },
      sharedAt: shareRecord.createdAt
    };

    return NextResponse.json(sharedTrade);

  } catch (error) {
    console.error('Error al obtener trade compartido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 