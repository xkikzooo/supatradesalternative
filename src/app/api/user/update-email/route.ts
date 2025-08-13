import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'El correo es requerido' },
        { status: 400 }
      );
    }

    // Verificar si el correo ya está en uso
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
        NOT: {
          id: session.user.id
        }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo ya está en uso' },
        { status: 400 }
      );
    }

    // Actualizar el correo
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        email
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar el correo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el correo' },
      { status: 500 }
    );
  }
} 