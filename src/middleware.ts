import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  const url = request.nextUrl.clone();

  // Redirigir checkout.supatrades.app a la página de checkout
  if (host === 'checkout.supatrades.app') {
    // Si ya está en /checkout, no necesitamos redirigir
    if (url.pathname === '/checkout') {
      return NextResponse.next();
    }

    // Si está yendo a /dashboard o cualquier otra ruta, redirigir a /checkout
    url.pathname = '/checkout';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /api (rutas API)
     * 2. /_next (archivos de Next.js)
     * 3. /_static (si estás usando exportación estática Vercel)
     * 4. Archivos estáticos y de recursos (extensiones definidas)
     */
    '/((?!api|_next|_static|.*\\..*|_vercel).*)',
  ],
}; 