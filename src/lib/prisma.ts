import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Manejo de errores de conexión
prisma.$connect()
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida correctamente');
  })
  .catch((error: Error) => {
    console.error('❌ Error al conectar con la base de datos:', error);
  }); 