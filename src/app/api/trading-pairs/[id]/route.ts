import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

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

    // Verificar que el par de trading existe
    const tradingPair = await prisma.tradingPair.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!tradingPair) {
      return NextResponse.json(
        { error: 'Par de trading no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el par de trading
    await prisma.tradingPair.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar par de trading:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el par de trading' },
      { status: 500 }
    );
  }
} 