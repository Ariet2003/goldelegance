import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { orderId, type, amount, description } = req.body;

      const expense = await prisma.expense.create({
        data: {
          type,
          amount: parseFloat(amount),
          description,
          orderId: parseInt(orderId),
        },
      });

      const order = await prisma.order.findUnique({
        where: { id: parseInt(orderId) },
        include: { expenses: true },
      });

      res.status(201).json({ expense, order });
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({ error: 'Failed to create expense' });
    }
  } else if (req.method === 'GET') {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    try {
      const expenses = await prisma.expense.findMany({
        where: {
          orderId: parseInt(orderId as string),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json(expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 