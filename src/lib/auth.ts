import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import NextAuth, { AuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { mockAuthOptions } from "./auth-mock";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id: string;
    } & DefaultSession["user"]
  }
}

// Determinar si estamos en modo de prueba local sin DB
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';

// Crear las opciones de autenticación según el modo
export const authOptions: AuthOptions = USE_MOCK_DB 
  ? mockAuthOptions 
  : {
    // Solo usar el adapter cuando no estamos en modo simulado
    adapter: PrismaAdapter(prisma as any), // Forzar el tipo para evitar errores de TypeScript
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          try {
            if (!credentials?.email || !credentials?.password) {
              throw new Error("Por favor, ingresa tu email y contraseña");
            }

            const user = await prisma.user.findUnique({
              where: {
                email: credentials.email,
              },
              select: {
                id: true,
                email: true,
                name: true,
                password: true,
              },
            });

            if (!user || !user.password) {
              throw new Error("No existe una cuenta con este email");
            }

            const isValid = await compare(credentials.password, user.password);

            if (!isValid) {
              throw new Error("La contraseña es incorrecta");
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
            };
          } catch (error) {
            throw error;
          }
        },
      }),
    ],
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.sub as string;
        }
        return session;
      },
      async jwt({ token, user }) {
        if (user) {
          token.sub = user.id;
        }
        return token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }; 