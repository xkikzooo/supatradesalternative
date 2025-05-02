'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Componente que usa useSearchParams
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || null;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token inválido o faltante');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    // Validar contraseñas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al restablecer la contraseña');
      }

      setIsSuccess(true);
      setMessage(data.message || 'Contraseña actualizada correctamente');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sección izquierda - Formulario */}
      <div className="flex w-full flex-col justify-center px-8 py-12 sm:w-1/2 sm:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/supatrades.svg"
              alt="Supatrades Logo"
              width={200}
              height={60}
              className="mb-6"
              priority
            />
            <h2 className="text-3xl font-bold tracking-tight text-white text-center">
              Restablece tu contraseña
            </h2>
            {!isSuccess && (
              <p className="mt-2 text-sm text-gray-400 text-center">
                Crea una nueva contraseña segura para tu cuenta
              </p>
            )}
          </div>

          {!token && (
            <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
              El enlace es inválido o ha expirado. Por favor, solicita un nuevo enlace para restablecer tu contraseña.
              <div className="mt-4 text-center">
                <Link
                  href="/login"
                  className="text-blue-500 hover:text-blue-400"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-6">
              <div className="rounded-lg bg-green-500/10 p-4 text-sm text-green-400">
                {message}
              </div>
              <div className="text-center">
                <Link
                  href="/login"
                  className="flex w-full justify-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          ) : (
            token && (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-400"
                  >
                    Nueva contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-800 bg-gray-800/50 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-400"
                  >
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-800 bg-gray-800/50 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </form>
            )
          )}
        </div>
      </div>

      {/* Sección derecha - Imagen */}
      <div className="hidden w-1/2 sm:block">
        <div className="relative h-full w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,71,161,0.2)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(126,87,194,0.2)_0%,transparent_50%)]" />
          <Image
            src="/login.jpg"
            alt="Trading background"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
      </div>
    </div>
  );
}

// Componente principal que usa Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Cargando...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
} 