import React, { useState } from 'react';
import Header from '../../components/Header';
import OrderForm from '../../components/OrderForm';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getServerSideProps() {
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
      orders: JSON.parse(JSON.stringify(orders)),
    },
  };
}

interface Order {
  id: number;
  title: string;
  clientName: string;
  clientContact: string;
  amount: number;
  orderDate: string;
  expenses: Array<{
    id: number;
    type: string;
    amount: number;
    description?: string;
  }>;
}

interface OrdersPageProps {
  orders: Order[];
}

const OrdersPage: React.FC<OrdersPageProps> = ({ orders: initialOrders }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const handleAddOrder = async (orderData: {
    title: string;
    clientName: string;
    clientContact: string;
    amount: number;
    orderDate: string;
  }) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error('Failed to add order');

      const newOrder = await response.json();
      setOrders([newOrder, ...orders]);
      setShowOrderForm(false);
    } catch (error) {
      console.error('Error adding order:', error);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Заказы</h1>
          <button
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="btn btn-primary"
          >
            {showOrderForm ? 'Отменить' : 'Добавить заказ'}
          </button>
        </div>

        {showOrderForm && (
          <div className="mb-8">
            <OrderForm onSubmit={handleAddOrder} />
          </div>
        )}

        <div className="grid gap-6">
          {orders.map((order) => {
            const stats = calculateOrderStats(order);
            
            return (
              <div key={order.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{order.title}</h2>
                    <p className="text-gray-400">{order.clientName}</p>
                    <p className="text-gray-400">{order.clientContact}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{order.amount.toLocaleString()} ₽</p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-2">Финансовый отчет</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Стоимость заказа</p>
                      <p className="text-lg font-semibold">{order.amount.toLocaleString()} ₽</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Расходы</p>
                      <p className="text-lg font-semibold">{stats.totalExpenses.toLocaleString()} ₽</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Доход</p>
                      <p className="text-lg font-semibold">{stats.profit.toLocaleString()} ₽</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Распределение дохода</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">50%</p>
                        <p className="font-semibold">{stats.profitShares.fifty.toLocaleString()} ₽</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">40%</p>
                        <p className="font-semibold">{stats.profitShares.forty.toLocaleString()} ₽</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">10%</p>
                        <p className="font-semibold">{stats.profitShares.ten.toLocaleString()} ₽</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default OrdersPage; 