import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import type { Order, OrderInput } from '../../../types/order';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Order | Order[] | { error: string }>
) {
  if (req.method === 'POST') {
    try {
      const orderInput: OrderInput = req.body;

      const order = await prisma.order.create({
        data: {
          title: orderInput.title,
          clientName: orderInput.clientName,
          contact: orderInput.contact,
          amount: parseFloat(orderInput.amount.toString()),
          orderDate: new Date(orderInput.orderDate),
          isDeposit: orderInput.isDeposit,
          deposit: orderInput.isDeposit ? parseFloat(orderInput.deposit!.toString()) : null,
          isPaid: false,
        },
        include: {
          expenses: true,
        },
      });

      const orderWithDates: Order = {
        ...order,
        orderDate: order.orderDate.toISOString(),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        expenses: order.expenses.map(expense => ({
          ...expense,
          createdAt: expense.createdAt.toISOString(),
        })),
      };

      res.status(201).json(orderWithDates);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  } else if (req.method === 'GET') {
    try {
      const orders = await prisma.order.findMany({
        include: {
          expenses: true,
        },
        orderBy: {
          orderDate: 'desc',
        },
      });

      const ordersWithDates: Order[] = orders.map(order => ({
        ...order,
        orderDate: order.orderDate.toISOString(),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        expenses: order.expenses.map(expense => ({
          ...expense,
          createdAt: expense.createdAt.toISOString(),
        })),
      }));

      res.status(200).json(ordersWithDates);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 