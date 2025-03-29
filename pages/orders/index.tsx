import React, { useState, useEffect } from 'react';
import type { GetServerSideProps } from 'next';
import Header from '../../components/Header';
import OrderForm from '../../components/OrderForm';
import OrderDetails from '../../components/OrderDetails';
import { prisma } from '../../lib/prisma';
import type { Order, OrderInput } from '../../types/order';
import { FaPlus } from 'react-icons/fa';

export const getServerSideProps: GetServerSideProps = async () => {
  const orders = await prisma.order.findMany({
    include: {
      expenses: true,
    },
    orderBy: {
      orderDate: 'desc',
    },
  });

  return {
    props: {
      initialOrders: JSON.parse(JSON.stringify(orders)),
    },
  };
};

const OrdersPage: React.FC<{ initialOrders: Order[] }> = ({ initialOrders }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleCreateOrder = async (orderData: {
    title: string;
    clientName: string;
    contact: string;
    amount: number;
    orderDate: string;
    isDeposit: boolean;
    deposit: number | null;
  }) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (response.ok) {
        setShowOrderForm(false);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleAddExpense = async (orderId: number, expense: { type: string; amount: number; description: string }) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map(order => order.id === orderId ? updatedOrder : order));
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleUpdateExpense = async (orderId: number, expenseId: number, expense: { type: string; amount: number; description: string }) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map(order => order.id === orderId ? updatedOrder : order));
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteExpense = async (orderId: number, expenseId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/expenses/${expenseId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map(order => order.id === orderId ? updatedOrder : order));
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: number, isPaid: boolean) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPaid }),
      });

      if (!response.ok) throw new Error('Failed to update payment status');

      const updatedOrder = await response.json();
      setOrders(orders.map(order => order.id === orderId ? updatedOrder : order));
      setSelectedOrder(updatedOrder);
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted: true }),
      });

      if (!response.ok) throw new Error('Failed to complete order');

      const updatedOrder = await response.json();
      setOrders(orders.map(order => order.id === orderId ? updatedOrder : order));
      setSelectedOrder(updatedOrder);
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const calculateOrderStats = (order: Order) => {
    const totalExpenses = order.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = order.amount - totalExpenses;
    
    return {
      totalExpenses,
      profit,
      profitShares: {
        fifty: profit * 0.5,
        forty: profit * 0.4,
        ten: profit * 0.1,
      },
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 bg-clip-text text-transparent">
            Заказы
          </h1>
          <button
            onClick={() => setShowOrderForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 transform hover:scale-[1.02] font-medium"
          >
            <FaPlus className="text-sm" /> Новый заказ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="group bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-purple-500/50 overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/10 transform hover:scale-[1.02]"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-white group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {order.title}
                    </h2>
                    <p className="text-gray-400 mt-1">{order.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                      {order.amount.toLocaleString()} ₽
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showOrderForm && (
          <OrderForm onSubmit={handleCreateOrder} onClose={() => setShowOrderForm(false)} />
        )}

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-700/50 shadow-2xl shadow-purple-500/10">
              <OrderDetails
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onAddExpense={handleAddExpense}
                onUpdateExpense={handleUpdateExpense}
                onDeleteExpense={handleDeleteExpense}
                onUpdatePaymentStatus={handleUpdatePaymentStatus}
                onCompleteOrder={handleCompleteOrder}
                calculateOrderStats={calculateOrderStats}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage; 