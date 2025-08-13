import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Validar que la contraseña tenga al menos 8 caracteres
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Buscar el token válido (no expirado)
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Verificar que el token no haya expirado
    if (new Date() > new Date(verificationToken.expires)) {
      // Eliminar el token expirado
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: 'El token ha expirado. Por favor, solicita un nuevo enlace' },
        { status: 400 }
      );
    }

    // Buscar el usuario asociado al token
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Hashear la nueva contraseña
    const hashedPassword = await hash(password, 10);

    // Actualizar la contraseña del usuario
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Eliminar el token usado
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    return NextResponse.json(
      { error: 'Error al restablecer la contraseña' },
      { status: 500 }
    );
  }
} 