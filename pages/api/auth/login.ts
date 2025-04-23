import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Проверяем наличие JWT_SECRET при инициализации
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Преобразуем строку в Buffer для использования в качестве секретного ключа
const JWT_SECRET_BUFFER = Buffer.from(JWT_SECRET, 'utf-8');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Проверяем учетные данные из переменных окружения
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    try {
      // Создаем случайный sessionId
      const sessionId = crypto.randomBytes(32).toString('hex');
      
      // Создаем JWT токен с использованием Buffer в качестве секретного ключа
      const token = jwt.sign(
        { 
          username,
          sessionId,
          role: 'admin'
        },
        JWT_SECRET_BUFFER,
        { 
          expiresIn: '24h',
          algorithm: 'HS256'
        }
      );

      // Устанавливаем cookie с JWT
      res.setHeader(
        'Set-Cookie',
        serialize('auth', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24, // 24 часа
          path: '/',
        })
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error creating JWT:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  return res.status(401).json({ success: false });
} 