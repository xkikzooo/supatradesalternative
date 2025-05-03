import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'El correo electrónico y el código son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el código tenga el formato correcto
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'El código debe contener 6 dígitos' },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya está verificado
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'La cuenta ya ha sido verificada' },
        { status: 200 }
      );
    }

    // Buscar el código de verificación
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'El código es inválido o ha expirado' },
        { status: 400 }
      );
    }

    // Actualizar el usuario como verificado
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
      },
    });

    // Eliminar el token de verificación usado
    await prisma.verificationToken.delete({
      where: { 
        token: code
      },
    });

    return NextResponse.json({
      message: 'Cuenta verificada correctamente',
    });
  } catch (error) {
    console.error('Error al verificar la cuenta:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 