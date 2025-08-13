import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { randomBytes } from 'crypto';

export async function POST(
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
      }
    });

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade no encontrado o no autorizado' },
        { status: 404 }
      );
    }

    // Generar un token único para compartir
    const shareToken = randomBytes(32).toString('hex');
    
    // Crear o actualizar el registro de compartir
    const shareRecord = await prisma.tradeShare.upsert({
      where: {
        tradeId: params.id
      },
      update: {
        token: shareToken,
        updatedAt: new Date()
      },
      create: {
        tradeId: params.id,
        token: shareToken,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Crear la URL compartible
    const baseUrl = process.env.PUBLIC_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://www.supatrades.app' 
        : process.env.NEXTAUTH_URL || 'http://localhost:3000');
    
    const shareUrl = `${baseUrl}/shared/trade/${shareToken}`;

    return NextResponse.json({
      shareToken,
      shareUrl,
      message: 'Link de compartir generado correctamente'
    });

  } catch (error) {
    console.error('Error al generar link de compartir:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 