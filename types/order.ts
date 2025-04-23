export interface Order {
  id: number;
  title: string;
  clientName: string;
  contact: string;
  amount: number;
  orderDate: string | Date;
  isDeposit: boolean;
  deposit: number | null;
  isPaid: boolean;
  isCompleted: boolean;
  expenses: Expense[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Expense {
  id: number;
  type: string;
  amount: number;
  description: string | null;
  orderId: number;
  createdAt: string | Date;
}

export interface OrderInput {
  title: string;
  clientName: string;
  contact: string;
  amount: number;
  orderDate: string;
  isDeposit: boolean;
  deposit: number | null;
} 