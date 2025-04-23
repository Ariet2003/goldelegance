import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Header: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <nav className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link 
            href="/" 
            className="text-xl sm:text-2xl font-bold text-white hover:text-purple-400 transition-colors"
          >
            GoldElegance
          </Link>
          <div className="flex gap-4 sm:gap-6 items-center">
            <Link 
              href="/orders" 
              className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
            >
              Заказы
            </Link>
            <Link 
              href="/reports" 
              className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
            >
              Отчетность
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base bg-transparent border border-gray-600 px-3 py-1 rounded hover:bg-gray-700"
            >
              Выход
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 