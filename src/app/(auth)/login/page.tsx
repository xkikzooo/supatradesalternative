'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 py-8">
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
          </div>
          <div className="bg-white/5 backdrop-blur-xl w-full rounded-2xl shadow-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold tracking-tight text-white text-center mb-6">
              Recupera tu contraseña
            </h2>
            <p className="mb-6 text-sm text-white/70 text-center">
              Ingresa tu correo electrónico para recibir un enlace de recuperación
            </p>

            <form className="space-y-5" onSubmit={handleRecoverySubmit}>
              {recoveryMessage && (
                <div className={`rounded-xl p-4 text-sm backdrop-blur-sm ${
                  recoveryStatus === 'error' ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                }`}>
                  {recoveryMessage}
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  id="recovery-email"
                  name="email"
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                  placeholder="tu@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={recoveryStatus === 'loading'}
                className="w-full bg-blue-500/80 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {recoveryStatus === 'loading' ? 'Enviando...' : 'Enviar enlace de recuperación'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowRecovery(false)}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                Volver al login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sección izquierda - Formulario */}
      <div className="flex-1 flex flex-col items-center justify-center bg-black px-4 py-8">
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
          </div>
          <div className="bg-white/5 backdrop-blur-xl w-full rounded-2xl shadow-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold tracking-tight text-white text-center mb-4">
              Inicia sesión
            </h2>
            <p className="mb-6 text-sm text-white/70 text-center">
              O{' '}
              <Link
                href="/register"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                crea una cuenta si no tienes una
              </Link>
            </p>

            {error && (
              <div className="mb-6 rounded-xl p-4 text-sm bg-red-500/10 text-red-300 border border-red-500/20 backdrop-blur-sm">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500/80 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Sección derecha - Imagen */}
      <div className="hidden w-1/2 sm:block">
        <div className="relative h-full w-full">
          <div className="absolute inset-0 bg-black" />
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