import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Idiomas soportados
  locales: ['es', 'en'],

  // Idioma por defecto
  defaultLocale: 'es',

  // Detectar idioma del navegador
  localeDetection: true,
});

export const config = {
  // Aplicar middleware a todas las rutas excepto:
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
