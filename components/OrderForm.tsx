import React, { useState } from 'react';

interface OrderFormProps {
  onSubmit: (orderData: {
    title: string;
    clientName: string;
    clientContact: string;
    amount: number;
    orderDate: string;
  }) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientContact: '',
    amount: '',
    orderDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Название заказа
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-black bg-opacity-50 rounded-lg focus:ring-2 focus:ring-white"
        />
      </div>

      <div>
        <label htmlFor="clientName" className="block text-sm font-medium mb-1">
          ФИО заказчика
        </label>
        <input
          type="text"
          id="clientName"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-black bg-opacity-50 rounded-lg focus:ring-2 focus:ring-white"
        />
      </div>

      <div>
        <label htmlFor="clientContact" className="block text-sm font-medium mb-1">
          Контактные данные
        </label>
        <input
          type="text"
          id="clientContact"
          name="clientContact"
          value={formData.clientContact}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-black bg-opacity-50 rounded-lg focus:ring-2 focus:ring-white"
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1">
          Сумма заказа
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="w-full px-3 py-2 bg-black bg-opacity-50 rounded-lg focus:ring-2 focus:ring-white"
        />
      </div>

      <div>
        <label htmlFor="orderDate" className="block text-sm font-medium mb-1">
          Дата оформления
        </label>
        <input
          type="date"
          id="orderDate"
          name="orderDate"
          value={formData.orderDate}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-black bg-opacity-50 rounded-lg focus:ring-2 focus:ring-white"
        />
      </div>

      <button type="submit" className="btn btn-primary w-full">
        Добавить заказ
      </button>
    </form>
  );
};

export default OrderForm; 