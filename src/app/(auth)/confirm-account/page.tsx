'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

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
          <div className="flex items-center gap-3 mb-6">
            <Mail className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Confirma tu cuenta
            </h2>
          </div>
          
          <p className="mb-6 text-sm text-white/70 text-center">
            Hemos enviado un código de verificación de 6 dígitos a tu correo electrónico.
            {email && <span className="block font-semibold text-blue-400 mt-2">{email}</span>}
          </p>

          <form className="space-y-5" onSubmit={handleVerifyCode}>
            {error && (
              <div className="rounded-xl p-4 text-sm bg-red-500/10 text-red-300 border border-red-500/20 backdrop-blur-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="rounded-xl p-4 text-sm bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 backdrop-blur-sm">
                {success}
              </div>
            )}

            <div>
              <label
                htmlFor="verification-code"
                className="block text-sm font-medium text-white/80 mb-2"
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
                className="block w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 text-center text-xl tracking-widest"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full bg-blue-500/80 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? 'Verificando...' : 'Verificar cuenta'}
            </button>
            
            <div className="text-center">
              <p className="text-sm text-white/60 mb-3">
                ¿No recibiste el código?
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={!canResend || isLoading}
                className={`text-sm flex items-center justify-center gap-2 mx-auto ${
                  canResend 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-white/40'
                } transition-colors`}
              >
                {canResend ? (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Reenviar código
                  </>
                ) : (
                  `Reenviar código en ${countdown} segundos`
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Componente principal que usa Suspense
export default function ConfirmAccountPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-white/60">Cargando...</p>
        </div>
      </div>
    }>
      <ConfirmAccountContent />
    </Suspense>
  );
} 