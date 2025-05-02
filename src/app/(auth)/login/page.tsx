'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      setError('Ocurrió un error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRecoveryStatus('loading');
    setRecoveryMessage('');

    try {
      const response = await fetch('/api/auth/recover-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar el enlace de recuperación');
      }

      setRecoveryStatus('success');
      setRecoveryMessage('Te hemos enviado un enlace para restablecer tu contraseña. Por favor, revisa tu correo electrónico.');
    } catch (error) {
      setRecoveryStatus('error');
      setRecoveryMessage(error instanceof Error ? error.message : 'Error al enviar el enlace de recuperación');
    }
  };

  if (showRecovery) {
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
              <h2 className="text-2xl font-bold tracking-tight text-white text-center mb-6">
                Recupera tu contraseña
              </h2>
              <p className="mb-6 text-sm text-gray-400 text-center">
                Ingresa tu correo electrónico para recibir un enlace de recuperación
              </p>

              <form className="space-y-5" onSubmit={handleRecoverySubmit}>
                {recoveryMessage && (
                  <div className={`rounded-lg p-4 text-sm ${
                    recoveryStatus === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                  }`}>
                    {recoveryMessage}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="recovery-email"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="recovery-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="tu@email.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={recoveryStatus === 'loading'}
                  className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {recoveryStatus === 'loading' ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Inicia sesión en tu cuenta
            </h2>
            <p className="mb-6 text-sm text-gray-400 text-center">
              O{' '}
              <Link
                href="/register"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                regístrate si aún no tienes una
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
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="••••••••"
                />
                <div className="mt-1 text-right">
                  <button
                    type="button"
                    onClick={() => setShowRecovery(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors mt-6"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 