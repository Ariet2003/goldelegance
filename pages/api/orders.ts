import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { title, clientName, clientContact, amount, orderDate } = req.body;

      const order = await prisma.order.create({
        data: {
          title,
          clientName,
          clientContact,
          amount: parseFloat(amount),
          orderDate: new Date(orderDate),
        },
      });

      res.status(201).json(order);
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

      res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 