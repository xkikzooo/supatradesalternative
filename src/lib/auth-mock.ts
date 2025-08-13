import { compare } from "bcryptjs";
import NextAuth, { AuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { mockDB } from "./mock-db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id: string;
    } & DefaultSession["user"]
  }
}

export const mockAuthOptions: AuthOptions = {
  // No se usa adapter porque estamos usando la base de datos en memoria
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

          // Para pruebas, permitir un login rápido sin verificar la contraseña
          if (credentials.email === "demo@example.com") {
            return {
              id: "user-test-1",
              email: "demo@example.com",
              name: "Usuario Demo",
            };
          }

          const user = await mockDB.user.findUnique({
            where: {
              email: credentials.email,
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