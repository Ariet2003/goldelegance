import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Функция для проверки JWT токена
async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    return verified.payload;
  } catch (err) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Если пользователь пытается получить доступ к защищенным маршрутам
  if (!isLoginPage) {
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const verified = await verifyAuth(authCookie.value);
    if (!verified) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Если пользователь аутентифицирован и пытается получить доступ к странице входа
  if (authCookie && isLoginPage) {
    const verified = await verifyAuth(authCookie.value);
    if (verified) {
      return NextResponse.redirect(new URL('/orders', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/orders/:path*',
    '/login'
  ],
}; 