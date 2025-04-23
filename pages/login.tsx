import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/orders');
      } else {
        setError('Неверный логин или пароль');
      }
    } catch (err) {
      setError('Произошла ошибка при входе');
    }
  };

  return (
    <>
      <Head>
        <title>Вход | Gold Elegance</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[90%] sm:max-w-md space-y-6 sm:space-y-8 p-6 sm:p-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <div className="space-y-2 sm:space-y-4">
            <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white">
              Gold Elegance
            </h2>
            <p className="text-center text-sm sm:text-base text-gray-400">
              Войдите в систему управления
            </p>
          </div>
          <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm text-center">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                  Логин
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 sm:py-2.5 border border-gray-600 placeholder-gray-400 text-white rounded-md bg-gray-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 text-sm sm:text-base"
                  placeholder="Введите логин"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Пароль
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 sm:py-2.5 border border-gray-600 placeholder-gray-400 text-white rounded-md bg-gray-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 text-sm sm:text-base"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="relative w-full flex justify-center px-4 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-colors duration-200 ease-in-out shadow-sm hover:shadow-md"
              >
                Войти в систему
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 