'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Componente con la funcionalidad de confirmación
function ConfirmAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Obtener el correo electrónico de los parámetros de URL
    const emailParam = searchParams?.get('email') || null;
    
    if (emailParam) {
      setEmail(emailParam);
      sessionStorage.setItem('verificationEmail', emailParam);
    } else {
      const storedEmail = sessionStorage.getItem('verificationEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }

    // Iniciar el contador regresivo
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar que el código tenga exactamente 6 dígitos
      if (!/^\d{6}$/.test(verificationCode)) {
        throw new Error('El código debe contener 6 dígitos');
      }

      const response = await fetch('/api/auth/verify-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          code: verificationCode 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar la cuenta');
      }

      setSuccess('¡Tu cuenta ha sido verificada correctamente!');
      
      // Redirigir al dashboard después de un breve retraso
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al verificar la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al reenviar el código');
      }

      setSuccess('Se ha enviado un nuevo código a tu correo electrónico');
      setCanResend(false);
      setCountdown(60);
      
      // Reiniciar el contador
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al reenviar el código');
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
              Confirma tu cuenta
            </h2>
            <p className="mb-6 text-sm text-gray-400 text-center">
              Hemos enviado un código de verificación de 6 dígitos a tu correo electrónico.
              {email && <span className="block font-semibold text-blue-400 mt-1">{email}</span>}
            </p>

            <form className="space-y-5" onSubmit={handleVerifyCode}>
              {error && (
                <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="rounded-lg bg-green-500/10 p-4 text-sm text-green-400">
                  {success}
                </div>
              )}

              <div>
                <label
                  htmlFor="verification-code"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Código de verificación
                </label>
                <input
                  id="verification-code"
                  name="verification-code"
                  type="text"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="off"
                  className="block w-full rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-center text-xl tracking-widest"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors mt-6"
              >
                {isLoading ? 'Verificando...' : 'Verificar cuenta'}
              </button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-400 mb-2">
                  ¿No recibiste el código?
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={!canResend || isLoading}
                  className={`text-sm ${canResend ? 'text-blue-400 hover:text-blue-300' : 'text-gray-500'} transition-colors`}
                >
                  {canResend 
                    ? 'Reenviar código' 
                    : `Reenviar código en ${countdown} segundos`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal que usa Suspense
export default function ConfirmAccountPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Cargando...</p>
        </div>
      </div>
    }>
      <ConfirmAccountContent />
    </Suspense>
  );
} 