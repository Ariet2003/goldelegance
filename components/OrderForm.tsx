import React, { useState } from 'react';

interface OrderFormProps {
  onSubmit: (order: {
    title: string;
    clientName: string;
    contact: string;
    amount: number;
    orderDate: string;
    isDeposit: boolean;
    deposit: number | null;
  }) => void;
  onClose: () => void;
}

export default function OrderForm({ onSubmit, onClose }: OrderFormProps) {
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [contact, setContact] = useState('');
  const [amount, setAmount] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [isDeposit, setIsDeposit] = useState(false);
  const [deposit, setDeposit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      clientName,
      contact,
      amount: parseFloat(amount),
      orderDate,
      isDeposit,
      deposit: isDeposit ? parseFloat(deposit) : null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-gray-700/50 shadow-2xl shadow-purple-500/10">
        <div className="p-8 pb-4">
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 bg-clip-text text-transparent">
            Новый заказ
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-8">
          <form id="orderForm" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Название заказа
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                placeholder="Введите название заказа"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Имя клиента
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                placeholder="Введите имя клиента"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Контакт
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                placeholder="Введите контактные данные"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Сумма заказа
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                placeholder="Введите сумму заказа"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Дата заказа
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={isDeposit}
                onChange={(e) => setIsDeposit(e.target.checked)}
                className="h-5 w-5 rounded-md border-gray-700 bg-gray-800/50 text-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-0 transition-all duration-200"
              />
              <label className="ml-3 block text-sm text-gray-300">
                Есть задаток
              </label>
            </div>

            {isDeposit && (
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-4 border border-gray-600/50">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Сумма задатка
                </label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  required
                  min="0"
                  max={amount}
                  step="0.01"
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                  placeholder="Введите сумму задатка"
                />
              </div>
            )}
          </form>
        </div>

        <div className="p-8 pt-4 bg-gradient-to-b from-transparent via-gray-900 to-gray-900">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-gray-300 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              form="orderForm"
              className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              Создать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 