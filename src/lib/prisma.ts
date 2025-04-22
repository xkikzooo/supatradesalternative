import { PrismaClient } from '@prisma/client';
import { mockDB } from './mock-db';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | typeof mockDB | undefined;
};

// Determinar si estamos en modo de prueba local sin DB
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';

const prismaClientSingleton = () => {
  if (USE_MOCK_DB) {
    console.log('🧪 Usando base de datos simulada');
    return mockDB;
  }
  
  console.log('🔌 Conectando a la base de datos real');
  return new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
  });
};

// Para evitar problemas de tipo, usamos as any aquí, pero es seguro
// porque en tiempo de ejecución, siempre usaremos o bien PrismaClient
// o bien nuestro mockDB que implementa los mismos métodos necesarios
export const prisma = (globalForPrisma.prisma ?? prismaClientSingleton()) as any;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Manejo de errores de conexión
if (!USE_MOCK_DB) {
  prisma.$connect()
    .then(() => {
      console.log('✅ Conexión a la base de datos establecida correctamente');
    })
    .catch((error: Error) => {
      console.error('❌ Error al conectar con la base de datos:', error);
    });
} else {
  console.log('✅ Base de datos simulada inicializada correctamente');
} 