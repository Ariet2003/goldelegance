import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Header from '../../components/Header';
import * as XLSX from 'xlsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Order {
  id: number;
  title: string;
  amount: number;
  orderDate: string;
  expenses: Array<{
    id: number;
    type: string;
    amount: number;
  }>;
}

const ReportsPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchOrders();
  }, [dateRange]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const filterOrdersByDate = (orders: Order[]) => {
    return orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  const prepareChartData = (filteredOrders: Order[]) => {
    const data = filteredOrders.reduce((acc, order) => {
      const date = new Date(order.orderDate).toLocaleDateString();
      const totalExpenses = order.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const profit = order.amount - totalExpenses;

      if (!acc[date]) {
        acc[date] = {
          revenue: 0,
          expenses: 0,
          profit: 0,
        };
      }

      acc[date].revenue += order.amount;
      acc[date].expenses += totalExpenses;
      acc[date].profit += profit;

      return acc;
    }, {} as Record<string, { revenue: number; expenses: number; profit: number }>);

    const dates = Object.keys(data).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return {
      labels: dates,
      datasets: [
        {
          label: 'Выручка',
          data: dates.map(date => data[date].revenue),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
        {
          label: 'Расходы',
          data: dates.map(date => data[date].expenses),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1,
        },
        {
          label: 'Прибыль',
          data: dates.map(date => data[date].profit),
          borderColor: 'rgb(153, 102, 255)',
          tension: 0.1,
        },
      ],
    };
  };

  const downloadExcel = () => {
    const filteredOrders = filterOrdersByDate(orders);
    const worksheet = XLSX.utils.json_to_sheet(
      filteredOrders.map(order => {
        const totalExpenses = order.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const profit = order.amount - totalExpenses;
        return {
          'Дата': new Date(order.orderDate).toLocaleDateString(),
          'Название': order.title,
          'Выручка': order.amount,
          'Расходы': totalExpenses,
          'Прибыль': profit,
          '50%': profit * 0.5,
          '40%': profit * 0.4,
          '10%': profit * 0.1,
        };
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Отчет');
    XLSX.writeFile(workbook, `Отчет_${dateRange.start}_${dateRange.end}.xlsx`);
  };

  const filteredOrders = filterOrdersByDate(orders);
  const chartData = prepareChartData(filteredOrders);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Отчетность</h1>
          <button onClick={downloadExcel} className="btn btn-primary">
            Скачать Excel
          </button>
        </div>

        <div className="card mb-8">
          <div className="flex gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Начальная дата
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 bg-black bg-opacity-50 rounded-lg focus:ring-2 focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Конечная дата
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 bg-black bg-opacity-50 rounded-lg focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          <div className="bg-white bg-opacity-5 p-4 rounded-lg">
            <Line data={chartData} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Финансовый отчет',
                  color: 'white',
                },
              },
              scales: {
                y: {
                  ticks: { color: 'white' },
                  grid: { color: 'rgba(255, 255, 255, 0.1)' },
                },
                x: {
                  ticks: { color: 'white' },
                  grid: { color: 'rgba(255, 255, 255, 0.1)' },
                },
              },
            }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-2">Общая выручка</h3>
            <p className="text-2xl font-bold">
              {filteredOrders.reduce((sum, order) => sum + order.amount, 0).toLocaleString()} ₽
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-2">Общие расходы</h3>
            <p className="text-2xl font-bold">
              {filteredOrders
                .reduce((sum, order) => sum + order.expenses.reduce((s, e) => s + e.amount, 0), 0)
                .toLocaleString()} ₽
            </p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-2">Общая прибыль</h3>
            <p className="text-2xl font-bold">
              {filteredOrders
                .reduce((sum, order) => {
                  const expenses = order.expenses.reduce((s, e) => s + e.amount, 0);
                  return sum + (order.amount - expenses);
                }, 0)
                .toLocaleString()} ₽
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportsPage; 