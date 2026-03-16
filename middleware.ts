import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'es',
  localePrefix: 'as-needed'
});

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
  
  return intlMiddleware(request);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|png|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
