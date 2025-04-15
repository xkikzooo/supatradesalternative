import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

// GET /api/trading-pairs - Obtener todos los pares de trading
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const tradingPairs = await prisma.tradingPair.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(tradingPairs);
  } catch (error) {
    console.error('Error al obtener pares de trading:', error);
    return NextResponse.json(
      { error: 'Error al obtener pares de trading' },
      { status: 500 }
    );
  }
}

// POST /api/trading-pairs - Crear un nuevo par de trading
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const tradingPair = await prisma.tradingPair.create({
      data: {
        name,
      },
    });

    return NextResponse.json(tradingPair, { status: 201 });
  } catch (error) {
    console.error('Error al crear par de trading:', error);
    return NextResponse.json(
      { error: 'Error al crear el par de trading' },
      { status: 500 }
    );
  }
} 