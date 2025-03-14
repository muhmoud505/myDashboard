import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
const protectedRoutes = ['/dashboard', '/control-products'];

export default function middleware(req) {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  const token = req.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  try {
    const decodedjwt = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (decodedjwt.exp < currentTime) {
      const response = NextResponse.redirect(new URL('/', req.url));
      response.cookies.delete('token');
      return response;
    }
    
    return NextResponse.next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    const response = NextResponse.redirect(new URL('/', req.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/control-products',
    '/profile'
  ]
};