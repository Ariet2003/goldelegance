import React, { useState } from 'react';
import { FaTaxi, FaImage, FaFont, FaUtensils, FaUsers, FaPlus, FaEdit, FaTrash, FaTimes, FaUser, FaPhone, FaCalendar, FaMoneyBillWave, FaReceipt, FaChartPie } from 'react-icons/fa';
import type { Order, Expense } from '../types/order';

interface OrderDetailsProps {
  order: {
    id: number;
    title: string;
    clientName: string;
    contact: string;
    amount: number;
    orderDate: string;
    isDeposit: boolean;
    deposit: number | null;
    isPaid: boolean;
    isCompleted?: boolean;
    expenses: {
      id: number;
      type: string;
      amount: number;
      description: string;
    }[];
  };
  onClose: () => void;
  onAddExpense: (orderId: number, expense: { type: string; amount: number; description: string }) => void;
  onUpdateExpense: (orderId: number, expenseId: number, expense: { type: string; amount: number; description: string }) => void;
  onDeleteExpense: (orderId: number, expenseId: number) => void;
  onUpdatePaymentStatus: (orderId: number, isPaid: boolean) => void;
  onCompleteOrder: (orderId: number) => void;
  calculateOrderStats: (order: Order) => {
    totalExpenses: number;
    profit: number;
    profitShares: {
      fifty: number;
      forty: number;
      ten: number;
    };
  };
}

const expenseTypes = [
  { id: 'taxi', name: 'Такси', icon: FaTaxi },
  { id: 'banner', name: 'Баннер', icon: FaImage },
  { id: 'inscription', name: 'Надпись', icon: FaFont },
  { id: 'food', name: 'Питание', icon: FaUtensils },
  { id: 'salary', name: 'Оплата сотрудникам', icon: FaUsers },
  { id: 'other', name: 'Другое', icon: FaPlus },
];

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose, onAddExpense, onUpdateExpense, onDeleteExpense, onUpdatePaymentStatus, onCompleteOrder, calculateOrderStats }) => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const totalExpenses = order.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const income = order.amount - totalExpenses;
  const remainingAmount = order.isDeposit && !order.isPaid ? order.amount - (order.deposit || 0) : 0;

  const stats = calculateOrderStats(order);

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpenseType || !expenseAmount) return;

    const expenseData = {
      type: selectedExpenseType,
      amount: parseFloat(expenseAmount),
      description: expenseDescription || '',
    };

    if (editingExpense) {
      await onUpdateExpense(order.id, editingExpense.id, expenseData);
    } else {
      await onAddExpense(order.id, expenseData);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
    setSelectedExpenseType('');
    setExpenseAmount('');
    setExpenseDescription('');
  };

  const handleEditExpense = (expense: { id: number; type: string; amount: number; description: string }) => {
    setEditingExpense({ ...expense, createdAt: '', orderId: order.id });
    setSelectedExpenseType(expense.type);
    setExpenseAmount(expense.amount.toString());
    setExpenseDescription(expense.description || '');
    setShowExpenseForm(true);
  };

  const handleDeleteClick = (expenseId: number) => {
    setShowDeleteConfirm(expenseId);
  };

  const handleConfirmDelete = async (expenseId: number) => {
    await onDeleteExpense(order.id, expenseId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700/50 shadow-2xl">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 to-transparent p-4 border-b border-gray-700/50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 bg-clip-text text-transparent">
                {order.title}
              </h2>
              <p className="text-gray-400 text-sm mt-1">Заказ #{order.id}</p>
            </div>
            <button 
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-800/50 text-gray-400 hover:text-white transition-all duration-200"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-3 text-purple-400 mb-3">
                  <FaUser size={16} />
                  <h3 className="font-medium">Информация о клиенте</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="text-gray-400">{order.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaPhone size={12} className="text-gray-500" />
                    <span className="text-gray-400">{order.contact}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-3 text-pink-400 mb-3">
                  <FaReceipt size={16} />
                  <h3 className="font-medium">Детали заказа</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaMoneyBillWave size={12} className="text-gray-500" />
                      <span className="text-gray-400">Сумма:</span>
                    </div>
                    <span className="text-white font-medium">{order.amount.toLocaleString()} ₽</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaCalendar size={12} className="text-gray-500" />
                      <span className="text-gray-400">Дата:</span>
                    </div>
                    <span className="text-white">{new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                  {order.isDeposit && (
                    <>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400">Задаток:</span>
                        <span className="text-white">{order.deposit?.toLocaleString()} ₽</span>
                      </div>
                      {!order.isPaid && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Остаток:</span>
                          <span className="text-red-400">{(order.amount - (order.deposit || 0)).toLocaleString()} ₽</span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => onUpdatePaymentStatus(order.id, !order.isPaid)}
                          disabled={order.isCompleted}
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                            order.isPaid
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20'
                          } ${order.isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {order.isPaid ? '✓ Оплачено полностью' : '⚡ Отметить как оплачено'}
                        </button>
                        {order.isPaid && !order.isCompleted && (
                          <button
                            onClick={() => onCompleteOrder(order.id)}
                            className="py-2 px-4 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all duration-200"
                          >
                            Завершить заказ
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 text-green-400 mb-3">
                <FaChartPie size={14} />
                <h3 className="font-medium">Финансы</h3>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/50">
                    <p className="text-xs text-gray-400">Общая сумма</p>
                    <p className="text-base font-semibold text-white">{order.amount.toLocaleString()} ₽</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/50">
                    <p className="text-xs text-gray-400">Расходы</p>
                    <p className="text-base font-semibold text-red-400">{stats.totalExpenses.toLocaleString()} ₽</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/50">
                    <p className="text-xs text-gray-400">Доход</p>
                    <p className="text-base font-semibold text-green-400">{stats.profit.toLocaleString()} ₽</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="bg-purple-900/20 rounded-lg p-2 border border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 text-xs">Айдар</span>
                      <span className="text-purple-400 text-xs font-medium">50%</span>
                    </div>
                    <p className="text-base font-bold text-white">{stats.profitShares.fifty.toLocaleString()} ₽</p>
                  </div>
                  <div className="bg-pink-900/20 rounded-lg p-2 border border-pink-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-pink-400 text-xs">Аман</span>
                      <span className="text-pink-400 text-xs font-medium">40%</span>
                    </div>
                    <p className="text-base font-bold text-white">{stats.profitShares.forty.toLocaleString()} ₽</p>
                  </div>
                  <div className="bg-purple-900/20 rounded-lg p-2 border border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 text-xs">Аэлиза</span>
                      <span className="text-purple-400 text-xs font-medium">10%</span>
                    </div>
                    <p className="text-base font-bold text-white">{stats.profitShares.ten.toLocaleString()} ₽</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-red-400">
                <FaMoneyBillWave size={16} />
                <h3 className="font-medium">Расходы</h3>
              </div>
              {!showExpenseForm && !order.isCompleted && (
                <button
                  onClick={() => setShowExpenseForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-all duration-200 text-sm font-medium border border-purple-500/20"
                >
                  <FaPlus size={12} />
                  <span>Добавить расход</span>
                </button>
              )}
            </div>

            {showExpenseForm && !order.isCompleted && (
              <form onSubmit={handleSubmitExpense} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 mb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                  {expenseTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedExpenseType(type.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                        selectedExpenseType === type.id
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                          : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-purple-500/30 hover:text-purple-400'
                      }`}
                    >
                      <type.icon size={20} />
                      <span className="text-xs font-medium">{type.name}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Сумма</label>
                    <input
                      type="number"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="Введите сумму"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Описание</label>
                    <input
                      type="text"
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="Введите описание (необязательно)"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-all duration-200 text-sm font-medium border border-purple-500/20"
                  >
                    {editingExpense ? 'Сохранить' : 'Добавить'}
                  </button>
                </div>
              </form>
            )}

            {order.expenses.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {order.expenses.map((expense) => {
                  const expenseType = expenseTypes.find(t => t.id === expense.type);
                  return (
                    <div
                      key={expense.id}
                      className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-200 group"
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="relative w-full">
                          <div className="flex justify-center">
                            {expenseType?.icon({ 
                              className: 'text-gray-400 group-hover:text-purple-400 transition-colors', 
                              size: 24 
                            })}
                          </div>
                          <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!order.isCompleted && (
                              <>
                                <button
                                  onClick={() => handleEditExpense(expense)}
                                  className="text-gray-400 hover:text-purple-400 transition-colors p-1"
                                >
                                  <FaEdit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(expense.id)}
                                  className="text-gray-400 hover:text-red-400 transition-colors p-1"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm font-medium">
                          {expenseType?.name || expense.type}
                        </p>
                        <p className="text-red-400 font-medium">{expense.amount.toLocaleString()} ₽</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">Нет расходов</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 