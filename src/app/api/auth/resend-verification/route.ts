import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomInt } from 'crypto';
import { createTransport } from 'nodemailer';

// Función para generar un código de 6 dígitos
function generateVerificationCode(): string {
  return randomInt(100000, 999999).toString();
}

// Configura el transportador de correo
function getEmailTransporter() {
  return createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
  });
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
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

    // Generar un nuevo código de verificación de 6 dígitos
    const verificationCode = generateVerificationCode();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Válido por 1 hora

    // Eliminar tokens anteriores para este email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    });

    // Guardar el nuevo código en la base de datos
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationCode,
        expires,
      },
    });

    // Enviar correo con el código de verificación
    const transporter = getEmailTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'no-reply@supatrades.com',
      to: email,
      subject: 'Verifica tu cuenta de Supatrades',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #1e40af;">Verifica tu cuenta</h2>
          <p>Gracias por registrarte en Supatrades. Para verificar tu cuenta, introduce el siguiente código en la página de verificación:</p>
          <div style="margin: 25px 0; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 6px; padding: 15px; background-color: #f3f4f6; border-radius: 5px; display: inline-block;">
              ${verificationCode}
            </div>
          </div>
          <p>Este código expirará en 1 hora por razones de seguridad.</p>
          <p>Si no solicitaste crear una cuenta en Supatrades, puedes ignorar este correo.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #666; font-size: 12px;">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Supatrades. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      message: 'Código de verificación enviado correctamente',
    });
  } catch (error) {
    console.error('Error al reenviar el código de verificación:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 