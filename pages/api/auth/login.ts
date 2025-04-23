import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

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
    // Создаем случайный sessionId
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    // Создаем JWT токен
    const token = jwt.sign(
      { 
        username,
        sessionId,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '24h' 
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
  }

  return res.status(401).json({ success: false });
} 