import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener todos los días con gimnasio activo para el usuario
    const gymDays = await prisma.gymDay.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        date: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // Convertir las fechas a formato string para el frontend
    const gymDaysFormatted = gymDays.map((gymDay: { date: Date }) => ({
      date: gymDay.date.toISOString().split("T")[0], // Formato YYYY-MM-DD
    }));

    return NextResponse.json(gymDaysFormatted);
  } catch (error) {
    console.error("Error al obtener días de gimnasio:", error);
    // Retornar array vacío en caso de error para que no falle el frontend
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { date, action } = await req.json();

    if (!date || !action) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (!["add", "remove"].includes(action)) {
      return NextResponse.json(
        { error: "Acción inválida" },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);

    if (action === "add") {
      // Agregar día de gimnasio
      await prisma.gymDay.upsert({
        where: {
          userId_date: {
            userId: session.user.id,
            date: targetDate,
          },
        },
        update: {},
        create: {
          userId: session.user.id,
          date: targetDate,
        },
      });
    } else {
      // Remover día de gimnasio
      await prisma.gymDay.deleteMany({
        where: {
          userId: session.user.id,
          date: targetDate,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar día de gimnasio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
