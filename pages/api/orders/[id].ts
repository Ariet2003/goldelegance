import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const orderId = parseInt(id as string);

  if (req.method === 'PATCH') {
    try {
      const updateData = req.body;
      
      // Проверяем, что обновляем
      const validFields = {
        isPaid: updateData.isPaid !== undefined,
        isCompleted: updateData.isCompleted !== undefined
      };

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          ...(validFields.isPaid && { isPaid: updateData.isPaid }),
          ...(validFields.isCompleted && { isCompleted: updateData.isCompleted })
        },
        include: {
          expenses: true
        }
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 