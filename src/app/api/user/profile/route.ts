import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const imageFile = formData.get('image') as File | null;

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    let imagePath = null;

    // Procesar imagen si se envió una
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Crear directorio si no existe
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
      await mkdir(uploadsDir, { recursive: true });

      // Generar nombre único para el archivo
      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Guardar archivo
      await writeFile(filePath, buffer);
      imagePath = `/uploads/profiles/${fileName}`;
    }

    // Actualizar usuario en la base de datos
    const updateData: any = { name };
    if (imagePath) {
      updateData.image = imagePath;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({
      message: 'Perfil actualizado correctamente',
      name: updatedUser.name,
      image: updatedUser.image,
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 