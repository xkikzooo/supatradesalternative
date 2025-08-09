import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/gym-days - Obtener todos los días de gimnasio del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const gymDays = await prisma.gymDay.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        date: true,
        notes: true,
        exercises: true,
        duration: true,
        createdAt: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Formatear las fechas para el frontend
    const formattedGymDays = gymDays.map((day: any) => ({
      ...day,
      date: day.date.toISOString().split('T')[0] // Formato YYYY-MM-DD
    }));

    return NextResponse.json(formattedGymDays);

  } catch (error) {
    console.error('Error al obtener días de gimnasio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/gym-days - Crear o toggle un día de gimnasio
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
    const { date, notes, exercises, duration } = body;

    if (!date) {
      return NextResponse.json(
        { error: 'La fecha es requerida' },
        { status: 400 }
      );
    }

    // Convertir fecha string a Date object
    const gymDate = new Date(date);
    gymDate.setUTCHours(12, 0, 0, 0); // Establecer a mediodía UTC para evitar problemas de zona horaria

    // Verificar si ya existe un día de gimnasio para esta fecha
    const existingGymDay = await prisma.gymDay.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: gymDate
        }
      }
    });

    if (existingGymDay) {
      // Si existe, eliminarlo (toggle off)
      await prisma.gymDay.delete({
        where: {
          id: existingGymDay.id
        }
      });

      return NextResponse.json({ 
        message: 'Día de gimnasio eliminado',
        action: 'removed',
        date: date
      });
    } else {
      // Si no existe, crearlo (toggle on)
      const newGymDay = await prisma.gymDay.create({
        data: {
          userId: session.user.id,
          date: gymDate,
          notes: notes || null,
          exercises: exercises || null,
          duration: duration || null
        }
      });

      return NextResponse.json({ 
        message: 'Día de gimnasio agregado',
        action: 'added',
        date: date,
        gymDay: {
          id: newGymDay.id,
          date: date,
          notes: newGymDay.notes,
          exercises: newGymDay.exercises,
          duration: newGymDay.duration
        }
      });
    }

  } catch (error) {
    console.error('Error al crear/eliminar día de gimnasio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 