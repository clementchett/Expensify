import { Expense, Frequency } from '../types';

export const calculateMonthlyDistribution = (expense: Expense): number[] => {
  const distribution = new Array(12).fill(0);
  const { amount, frequency, specificMonth } = expense;
  
  // Safe default start month (Jan = 0) if not specified
  const startMonth = specificMonth !== null && specificMonth !== undefined ? specificMonth : 0;

  switch (frequency) {
    case Frequency.MONTHLY:
      // Monthly expenses fill all slots regardless of start month 
      distribution.fill(amount);
      break;

    case Frequency.QUARTERLY:
      // Distribute every 3 months starting from the specific month (or Jan)
      for (let i = startMonth; i < 12; i += 3) {
        distribution[i] = amount;
      }
      break;

    case Frequency.YEARLY:
      // Once a year at the specific month (or Jan)
      if (startMonth >= 0 && startMonth < 12) {
        distribution[startMonth] = amount;
      }
      break;

    case Frequency.ONE_TIME:
      // Only in the specific month
      if (startMonth >= 0 && startMonth < 12) {
        distribution[startMonth] = amount;
      }
      break;
  }

  return distribution;
};

export const calculateTotalAnnual = (expense: Expense): number => {
  const dist = calculateMonthlyDistribution(expense);
  return dist.reduce((acc, curr) => acc + curr, 0);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
