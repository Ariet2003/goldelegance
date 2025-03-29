export interface Order {
  id: number;
  title: string;
  clientName: string;
  contact: string;
  amount: number;
  orderDate: string;
  isDeposit: boolean;
  deposit: number | null;
  isPaid: boolean;
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: number;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  orderId: number;
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