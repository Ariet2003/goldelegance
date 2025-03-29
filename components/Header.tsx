import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Header: React.FC = () => {
  const router = useRouter();

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
          <div className="flex gap-4 sm:gap-6">
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
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 