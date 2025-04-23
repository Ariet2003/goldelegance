import React, { useState, useEffect } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import Header from '../../components/Header';
import * as XLSX from 'xlsx';
import type { Order } from '../../types/order';
import { FaCalendar, FaChartLine, FaChartPie, FaDownload, FaFilter, FaMoneyBillWave, FaChartBar } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DateRange {
  start: string;
  end: string;
}

interface FilterOptions {
  status: 'all' | 'completed' | 'active';
  hasDeposit: 'all' | 'yes' | 'no';
  isPaid: 'all' | 'yes' | 'no';
}

const ReportsPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    hasDeposit: 'all',
    isPaid: 'all',
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'orders'>('overview');

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const filterOrders = (orders: Order[]) => {
    return orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      const dateInRange = orderDate >= startDate && orderDate <= endDate;
      
      const statusMatch = filters.status === 'all' 
        ? true 
        : filters.status === 'completed' ? order.isCompleted : !order.isCompleted;
      
      const depositMatch = filters.hasDeposit === 'all'
        ? true
        : filters.hasDeposit === 'yes' ? order.isDeposit : !order.isDeposit;
      
      const paidMatch = filters.isPaid === 'all'
        ? true
        : filters.isPaid === 'yes' ? order.isPaid : !order.isPaid;

      return dateInRange && statusMatch && depositMatch && paidMatch;
    });
  };

  const calculateStats = (filteredOrders: Order[]) => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.amount, 0);
    const totalExpenses = filteredOrders.reduce((sum, order) => 
      sum + order.expenses.reduce((s, e) => s + e.amount, 0), 0);
    const profit = totalRevenue - totalExpenses;
    
    const expensesByType = filteredOrders.reduce((acc, order) => {
      order.expenses.forEach(expense => {
        acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      totalExpenses,
      profit,
      profitShares: {
        owner: profit * 0.45,
        master: profit * 0.45,
        marketing: profit * 0.1,
      },
      expensesByType,
      orderCount: filteredOrders.length,
      averageCheck: totalRevenue / (filteredOrders.length || 1),
      completedCount: filteredOrders.filter(o => o.isCompleted).length,
      activeCount: filteredOrders.filter(o => !o.isCompleted).length,
      depositCount: filteredOrders.filter(o => o.isDeposit).length,
    };
  };

  const prepareChartData = (filteredOrders: Order[]) => {
    const data = filteredOrders.reduce((acc, order) => {
      const date = new Date(order.orderDate).toLocaleDateString();
      const totalExpenses = order.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      if (!acc[date]) {
        acc[date] = {
          revenue: 0,
          expenses: 0,
          profit: 0,
        };
      }
      
      acc[date].revenue += order.amount;
      acc[date].expenses += totalExpenses;
      acc[date].profit += order.amount - totalExpenses;
      
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
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Расходы',
          data: dates.map(date => data[date].expenses),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Прибыль',
          data: dates.map(date => data[date].profit),
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const prepareExpensesChartData = (stats: ReturnType<typeof calculateStats>) => {
    const types = {
      taxi: 'Такси',
      banner: 'Баннер',
      inscription: 'Надпись',
      food: 'Питание',
      salary: 'Оплата сотрудникам',
      gas: 'Бензин',
      other: 'Другое',
    };

    const data = Object.entries(stats.expensesByType).map(([type, amount]) => ({
      type: types[type as keyof typeof types] || type,
      amount,
    }));

    return {
      labels: data.map(d => d.type),
      datasets: [
        {
          data: data.map(d => d.amount),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(231, 233, 237, 0.8)',
          ],
        },
      ],
    };
  };

  const downloadExcel = (filteredOrders: Order[]) => {
    const stats = calculateStats(filteredOrders);
    
    // Лист со статистикой
    const statsWorksheet = XLSX.utils.json_to_sheet([
      [{ v: 'ОТЧЕТ ПО ЗАКАЗАМ', s: { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' } } }],
      [{ v: `Период: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`, s: { font: { bold: true }, alignment: { horizontal: 'center' } } }],
      [''],
      [{ v: 'ОБЩАЯ СТАТИСТИКА', s: { font: { bold: true, color: { rgb: '8B5CF6' } } } }],
      ['Общая выручка', stats.totalRevenue, 'с'],
      ['Общие расходы', stats.totalExpenses, 'с'],
      ['Чистая прибыль', stats.profit, 'с'],
      [''],
      [{ v: 'РАСПРЕДЕЛЕНИЕ ПРИБЫЛИ', s: { font: { bold: true, color: { rgb: '8B5CF6' } } } }],
      ['Владелец (Айдар) - 45%', stats.profitShares.owner, 'с'],
      ['Мастер (Аман) - 45%', stats.profitShares.master, 'с'],
      ['Маркетинг (Аэлиза) - 10%', stats.profitShares.marketing, 'с'],
      [''],
      [{ v: 'СТАТИСТИКА ЗАКАЗОВ', s: { font: { bold: true, color: { rgb: '8B5CF6' } } } }],
      ['Всего заказов', stats.orderCount, 'шт'],
      ['Средний чек', stats.averageCheck, 'с'],
      ['Завершенных заказов', stats.completedCount, 'шт'],
      ['Активных заказов', stats.activeCount, 'шт'],
      ['Заказов с предоплатой', stats.depositCount, 'шт'],
      [''],
      [{ v: 'СТРУКТУРА РАСХОДОВ', s: { font: { bold: true, color: { rgb: '8B5CF6' } } } }],
      ...Object.entries(stats.expensesByType).map(([type, amount]) => [type, amount, 'с']),
    ], { cellStyles: true });

    // Лист с детальной информацией по заказам
    const ordersHeaders = [
      'Дата заказа',
      'Название',
      'Клиент',
      'Контакт',
      'Сумма заказа (с)',
      'Расходы (с)',
      'Прибыль (с)',
      'Статус',
      'Оплата',
      'Предоплата',
      'Сумма предоплаты (с)'
    ];

    const ordersData = [
      ordersHeaders,
      ...filteredOrders.map(order => {
        const totalExpenses = order.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const profit = order.amount - totalExpenses;
        
        return [
          new Date(order.orderDate).toLocaleDateString(),
          order.title,
          order.clientName,
          order.contact || 'Не указан',
          order.amount,
          totalExpenses,
          profit,
          order.isCompleted ? 'Завершен' : 'Активен',
          order.isPaid ? 'Оплачен' : 'Не оплачен',
          order.isDeposit ? 'Есть' : 'Нет',
          order.deposit || 0
        ];
      })
    ];

    const ordersWorksheet = XLSX.utils.aoa_to_sheet(ordersData);

    // Лист с детальными расходами
    const expensesHeaders = [
      'Дата',
      'Заказ',
      'Клиент',
      'Тип расхода',
      'Сумма (с)'
    ];

    const expensesData = [
      expensesHeaders,
      ...filteredOrders.flatMap(order => 
        order.expenses.map(expense => [
          new Date(order.orderDate).toLocaleDateString(),
          order.title,
          order.clientName,
          expense.type,
          expense.amount
        ])
      )
    ];

    const expensesWorksheet = XLSX.utils.aoa_to_sheet(expensesData);

    // Настройка ширины колонок для всех листов
    const wscols = [
      { wch: 20 }, // A
      { wch: 40 }, // B
      { wch: 25 }, // C
      { wch: 20 }, // D
      { wch: 15 }, // E
      { wch: 15 }, // F
      { wch: 15 }, // G
      { wch: 15 }, // H
      { wch: 15 }, // I
      { wch: 15 }, // J
      { wch: 15 }, // K
    ];

    [statsWorksheet, ordersWorksheet, expensesWorksheet].forEach(ws => {
      ws['!cols'] = wscols;
    });

    // Создание книги и добавление листов
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Статистика');
    XLSX.utils.book_append_sheet(workbook, ordersWorksheet, 'Заказы');
    XLSX.utils.book_append_sheet(workbook, expensesWorksheet, 'Расходы');

    // Сохранение файла
    const fileName = `Отчет_${new Date(dateRange.start).toLocaleDateString()}_${new Date(dateRange.end).toLocaleDateString()}.xlsx`.replace(/\//g, '.');
    XLSX.writeFile(workbook, fileName);
  };

  const filteredOrders = filterOrders(orders);
  const stats = calculateStats(filteredOrders);
  const revenueChartData = prepareChartData(filteredOrders);
  const expensesChartData = prepareExpensesChartData(stats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 bg-clip-text text-transparent">
            Отчетность
          </h1>
          <button 
            onClick={() => downloadExcel(filteredOrders)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 transform hover:scale-[1.02] font-medium"
          >
            <FaDownload size={16} />
            Скачать Excel
          </button>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FaCalendar className="text-purple-400" />
                <h3 className="font-medium text-white">Период</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Начальная дата
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Конечная дата
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-500/50 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FaFilter className="text-purple-400" />
                <h3 className="font-medium text-white">Фильтры</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Статус
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FilterOptions['status'] }))}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white appearance-none cursor-pointer hover:bg-gray-800/50 transition-colors duration-200 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSIjOEI1Q0Y2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem]"
                  >
                    <option value="all" className="bg-gray-900 text-white">Все</option>
                    <option value="active" className="bg-gray-900 text-white">Активные</option>
                    <option value="completed" className="bg-gray-900 text-white">Завершенные</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Предоплата
                  </label>
                  <select
                    value={filters.hasDeposit}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasDeposit: e.target.value as FilterOptions['hasDeposit'] }))}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white appearance-none cursor-pointer hover:bg-gray-800/50 transition-colors duration-200 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSIjOEI1Q0Y2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem]"
                  >
                    <option value="all" className="bg-gray-900 text-white">Все</option>
                    <option value="yes" className="bg-gray-900 text-white">С предоплатой</option>
                    <option value="no" className="bg-gray-900 text-white">Без предоплаты</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Оплата
                  </label>
                  <select
                    value={filters.isPaid}
                    onChange={(e) => setFilters(prev => ({ ...prev, isPaid: e.target.value as FilterOptions['isPaid'] }))}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white appearance-none cursor-pointer hover:bg-gray-800/50 transition-colors duration-200 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSIjOEI1Q0Y2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem]"
                  >
                    <option value="all" className="bg-gray-900 text-white">Все</option>
                    <option value="yes" className="bg-gray-900 text-white">Оплаченные</option>
                    <option value="no" className="bg-gray-900 text-white">Неоплаченные</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                : 'text-gray-400 hover:text-purple-400'
            }`}
          >
            <FaChartLine size={16} />
            Обзор
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'expenses'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                : 'text-gray-400 hover:text-purple-400'
            }`}
          >
            <FaChartPie size={16} />
            Расходы
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'orders'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                : 'text-gray-400 hover:text-purple-400'
            }`}
          >
            <FaChartBar size={16} />
            Заказы
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Выручка</h3>
                  <FaMoneyBillWave className="text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalRevenue.toLocaleString()} с</p>
                <p className="text-sm text-gray-400 mt-1">За выбранный период</p>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Расходы</h3>
                  <FaMoneyBillWave className="text-red-400" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalExpenses.toLocaleString()} с</p>
                <p className="text-sm text-gray-400 mt-1">Общая сумма расходов</p>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Прибыль</h3>
                  <FaMoneyBillWave className="text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.profit.toLocaleString()} с</p>
                <p className="text-sm text-gray-400 mt-1">Чистая прибыль</p>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Средний чек</h3>
                  <FaMoneyBillWave className="text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.averageCheck.toLocaleString()} с</p>
                <p className="text-sm text-gray-400 mt-1">В среднем за заказ</p>
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Динамика показателей</h3>
              <div className="h-[400px]">
                <Line
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                        labels: { color: 'white' },
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
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 text-sm">Айдар</span>
                  <span className="text-purple-400 text-sm font-medium">45%</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.profitShares.owner.toLocaleString()} с</p>
              </div>
              <div className="bg-pink-900/20 rounded-xl p-6 border border-pink-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-pink-400 text-sm">Аман</span>
                  <span className="text-pink-400 text-sm font-medium">45%</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.profitShares.master.toLocaleString()} с</p>
              </div>
              <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 text-sm">Аэлиза</span>
                  <span className="text-purple-400 text-sm font-medium">10%</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.profitShares.marketing.toLocaleString()} с</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Структура расходов</h3>
              <div className="h-[400px] flex items-center justify-center">
                <Pie
                  data={expensesChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'right' as const,
                        labels: { color: 'white' },
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Расходы по категориям</h3>
              <div className="h-[400px]">
                <Bar
                  data={expensesChartData}
                  options={{
                    indexAxis: 'y' as const,
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                      },
                      y: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Статистика заказов</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Всего заказов</span>
                  <span className="text-white font-bold">{stats.orderCount}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Завершенные заказы</span>
                  <span className="text-green-400 font-bold">{stats.completedCount}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Активные заказы</span>
                  <span className="text-yellow-400 font-bold">{stats.activeCount}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Заказы с предоплатой</span>
                  <span className="text-purple-400 font-bold">{stats.depositCount}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Распределение статусов</h3>
              <div className="h-[400px] flex items-center justify-center">
                <Pie
                  data={{
                    labels: ['Завершенные', 'Активные'],
                    datasets: [{
                      data: [stats.completedCount, stats.activeCount],
                      backgroundColor: [
                        'rgba(72, 187, 120, 0.8)',
                        'rgba(236, 201, 75, 0.8)',
                      ],
                    }],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                        labels: { color: 'white' },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportsPage; 