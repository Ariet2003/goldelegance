import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Проверяем наличие JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Создаем секретный ключ для jose
const secret = new TextEncoder().encode(JWT_SECRET);

// Функция для проверки JWT токена
async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (err) {
    console.error('JWT verification error:', err);
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