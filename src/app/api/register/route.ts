import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el modo de prueba está activado
    const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';

    // Verificar si ya existe un usuario con ese email
    let existingUser;

    if (USE_MOCK_DB) {
      // En modo de prueba, simplemente damos acceso
      return NextResponse.json(
        { 
          message: "Modo de prueba: utiliza demo@example.com con cualquier contraseña para iniciar sesión", 
          email: "demo@example.com",
          name: "Usuario Demo"
        }
      );
    } else {
      // Verificar si el usuario existe en la base de datos real
      existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    // Crear usuario si no estamos en modo de prueba
    if (!USE_MOCK_DB) {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    }

    // Este punto no debería alcanzarse en modo de prueba
    return NextResponse.json(
      { message: "Usuario registrado correctamente" }
    );
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 