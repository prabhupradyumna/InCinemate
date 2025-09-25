import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // TEMPORARILY DISABLED AUTHENTICATION - Allow all routes for testing
  // Uncomment the code below to re-enable authentication

  return NextResponse.next();

  /*
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register"];

  // Admin routes that require specific roles
  const adminRoutes = ["/admin"];
  const superAdminRoutes = ["/super-admin"];

  // For client-side routes, let the ProtectedRoute component handle authentication
  // This prevents server-side redirects that conflict with client-side auth state
  if (
    pathname.startsWith("/booking") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/super-admin")
  ) {
    // Let the client-side ProtectedRoute handle authentication
    return NextResponse.next();
  }

  // Check if user is authenticated (simplified - in real app would verify JWT)
  const userCookie = request.cookies.get("screenlease_user");

  if (
    !userCookie &&
    !publicRoutes.includes(pathname) &&
    !pathname.startsWith("/_next")
  ) {
    // Redirect to login if not authenticated and trying to access protected route
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is authenticated, parse their role
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie.value);

      // Redirect based on role restrictions
      if (
        adminRoutes.some((route) => pathname.startsWith(route)) &&
        user.role !== "admin"
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (
        superAdminRoutes.some((route) => pathname.startsWith(route)) &&
        user.role !== "super-admin"
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // Invalid cookie, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
  */
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
