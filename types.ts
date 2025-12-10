export enum Frequency {
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  YEARLY = 'Yearly',
  ONE_TIME = 'One-Time'
}

export interface Expense {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: Frequency;
  specificMonth?: number | null; // 0 for Jan, 11 for Dec, null for default
}

export interface MonthlyData {
  month: string;
  total: number;
}
