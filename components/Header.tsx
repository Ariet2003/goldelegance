import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-gray-900 to-black text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          GoldElegance
        </Link>
        <div className="space-x-4">
          <Link href="/orders" className="hover:text-gray-300 transition-colors">
            Заказы
          </Link>
          <Link href="/reports" className="hover:text-gray-300 transition-colors">
            Отчетность
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header; 