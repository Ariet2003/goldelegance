import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import type { Order } from '../../../../../types/order';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Order | { error: string }>
) {
  const orderId = parseInt(req.query.id as string);
  const expenseId = parseInt(req.query.expenseId as string);

  if (req.method === 'PUT') {
    try {
      const { type, amount, description } = req.body;

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          expenses: {
            update: {
              where: { id: expenseId },
              data: {
                type,
                amount: parseFloat(amount.toString()),
                description,
              },
            },
          },
        },
        include: {
          expenses: true,
        },
      });

      const orderWithDates: Order = {
        ...updatedOrder,
        orderDate: updatedOrder.orderDate.toISOString(),
        createdAt: updatedOrder.createdAt.toISOString(),
        expenses: updatedOrder.expenses.map(expense => ({
          ...expense,
          createdAt: expense.createdAt.toISOString(),
        })),
      };

      res.status(200).json(orderWithDates);
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({ error: 'Failed to update expense' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          expenses: {
            delete: {
              id: expenseId,
            },
          },
        },
        include: {
          expenses: true,
        },
      });

      const orderWithDates: Order = {
        ...updatedOrder,
        orderDate: updatedOrder.orderDate.toISOString(),
        createdAt: updatedOrder.createdAt.toISOString(),
        expenses: updatedOrder.expenses.map(expense => ({
          ...expense,
          createdAt: expense.createdAt.toISOString(),
        })),
      };

      res.status(200).json(orderWithDates);
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 