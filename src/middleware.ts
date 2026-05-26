import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    const ownerRoutes = ["/reports", "/inventory", "/providers", "/settings/users"];
    const adminRoutes = ["/settings"];

    if (adminRoutes.some((r) => pathname === r)) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (ownerRoutes.some((r) => pathname.startsWith(r))) {
      if (token?.role === "SELLER") {
        return NextResponse.redirect(new URL("/sales/new", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)",
  ],
};