'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('name') as string;
    const firstName = fullName.split(' ')[0]; // Tomar solo el primer nombre
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: firstName,
          email, 
          password 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al registrar');
      }

      router.push(`/confirm-account?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ocurrió un error al registrar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/supatrades.svg"
            alt="Supatrades Logo"
            width={200}
            height={60}
            className="mb-6"
            priority
          />
          <div className="bg-gray-800/40 backdrop-blur-sm w-full rounded-xl shadow-2xl p-8 border border-gray-800">
            <h2 className="text-2xl font-bold tracking-tight text-white text-center mb-4">
              Crea tu cuenta
            </h2>
            <p className="mb-6 text-sm text-gray-400 text-center">
              O{' '}
              <Link
                href="/login"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                inicia sesión si ya tienes una
              </Link>
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="block w-full rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="block w-full rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="block w-full rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors mt-6"
              >
                {isLoading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 