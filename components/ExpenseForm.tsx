import React, { useState } from 'react';
import { FaTaxi, FaImage, FaFont, FaUtensils, FaUsers, FaPlus } from 'react-icons/fa';

interface ExpenseFormProps {
  onSubmit: (expenseData: {
    type: string;
    amount: number;
    description?: string;
  }) => void;
}

const expenseTypes = [
  { id: 'taxi', label: 'Такси', icon: FaTaxi },
  { id: 'banner', label: 'Баннер', icon: FaImage },
  { id: 'inscription', label: 'Надпись', icon: FaFont },
  { id: 'food', label: 'Питание', icon: FaUtensils },
  { id: 'salary', label: 'Оплата сотрудникам', icon: FaUsers },
  { id: 'other', label: 'Другое', icon: FaPlus },
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit }) => {
  const [selectedType, setSelectedType] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !amount) return;

    onSubmit({
      type: selectedType,
      amount: parseFloat(amount),
      description: description || undefined,
    });

    setSelectedType('');
    setAmount('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {expenseTypes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSelectedType(id)}
            className={`flex flex-col items-center p-4 rounded-lg transition-all ${
              selectedType === id
                ? 'bg-white bg-opacity-20 text-white'
                : 'bg-black bg-opacity-50 text-gray-400 hover:bg-opacity-70'
            }`}
          >
            <Icon className="text-2xl mb-2" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1">
          Сумма расхода
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
          step="0.01"
          className="w-full px-3 py-2 bg-black bg-opacity-50 rounded-lg focus:ring-2 focus:ring-white"
        />
      </div>

      {selectedType === 'other' && (
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Описание расхода
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-3 py-2 bg-black bg-opacity-50 rounded-lg focus:ring-2 focus:ring-white"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!selectedType || !amount}
        className="btn btn-primary w-full disabled:opacity-50"
      >
        Добавить расход
      </button>
    </form>
  );
};

export default ExpenseForm; 