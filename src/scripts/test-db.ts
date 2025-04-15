import { prisma } from '../lib/prisma';
import { hash } from 'bcryptjs';

async function main() {
  try {
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos establecida');

    // Crear usuario de prueba
    const hashedPassword = await hash('password123', 12);
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Usuario de Prueba',
        password: hashedPassword,
      },
    });

    console.log('✅ Usuario de prueba creado:', user.email);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 