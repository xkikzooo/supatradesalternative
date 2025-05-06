import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  const url = request.nextUrl.clone();

  // Manejar el subdominio checkout.supatrades.app
  if (host === 'checkout.supatrades.app') {
    // Mapeo de rutas para el subdominio
    const routeMapping: Record<string, string> = {
      '/': '/checkout',
      '/faq': '/checkout/faq',
      '/terms': '/checkout/terms',
      '/privacy': '/checkout/privacy',
      '/refund': '/checkout/refund'
    };

    // Verificar si la URL actual tiene un mapeo
    if (routeMapping[url.pathname]) {
      // Reescribir internamente a la ruta correspondiente sin cambiar la URL visible
      const newPath = routeMapping[url.pathname];
      url.pathname = newPath;
      return NextResponse.rewrite(url);
    }
    
    // Permitir rutas específicas de checkout (por si alguien accede directamente a ellas)
    if (url.pathname === '/checkout' || 
        url.pathname === '/checkout/faq' || 
        url.pathname === '/checkout/terms' || 
        url.pathname === '/checkout/privacy' || 
        url.pathname === '/checkout/refund') {
      return NextResponse.next();
    }

    // Si está yendo a cualquier otra ruta, redirigir a /checkout
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