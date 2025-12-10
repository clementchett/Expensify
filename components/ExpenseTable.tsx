import React, { useState, useMemo } from 'react';
import { Expense, Frequency } from '../types';
import { SHORT_MONTHS } from '../constants';
import { calculateMonthlyDistribution } from '../services/expenseUtils';
import { Edit2, Trash2, Tag, Layers, List } from 'lucide-react';

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  highlightedMonth: number | null;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, onEdit, onDelete, highlightedMonth }) => {
  const [isGrouped, setIsGrouped] = useState(false);

  // Group expenses by category
  const groupedData = useMemo<Record<string, Expense[]> | null>(() => {
    if (!isGrouped) return null;
    
    const groups: Record<string, Expense[]> = {};
    expenses.forEach(expense => {
      const cat = expense.category || 'Miscellaneous';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(expense);
    });
    
    // Sort categories alphabetically
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as Record<string, Expense[]>);
  }, [expenses, isGrouped]);

  // Calculate totals for a list of expenses
  const getTotals = (expenseList: Expense[]) => {
    const totals = new Array(12).fill(0);
    expenseList.forEach(expense => {
      const dist = calculateMonthlyDistribution(expense);
      dist.forEach((val, idx) => {
        totals[idx] += val;
      });
    });
    return totals;
  };

  const grandTotals = getTotals(expenses);

  const renderExpenseRow = (expense: Expense) => {
    const monthlyValues = calculateMonthlyDistribution(expense);
    return (
        <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
            {expense.name}
            </td>
            {!isGrouped && (
                <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                    <Tag size={12} className="opacity-70" />
                    {expense.category || 'Misc'}
                </div>
                </td>
            )}
            <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                ${expense.frequency === Frequency.MONTHLY ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                expense.frequency === Frequency.QUARTERLY ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 
                expense.frequency === Frequency.YEARLY ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'}`}>
                {expense.frequency === Frequency.MONTHLY ? 'Mo' : 
                expense.frequency === Frequency.QUARTERLY ? 'Qt' : 
                expense.frequency === Frequency.YEARLY ? 'Yr' : '1x'}
            </span>
            </td>
            {monthlyValues.map((val, idx) => (
            <td key={idx} className={`px-2 py-4 text-right text-sm border-x border-transparent transition-colors
                ${highlightedMonth === idx ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' : ''}
                ${val > 0 ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-300 dark:text-slate-600'}`}>
                {val > 0 ? val.toLocaleString() : '-'}
            </td>
            ))}
            <td className="px-4 py-4 text-center sticky right-0 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50 z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                onClick={() => onEdit(expense)}
                className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                title="Edit"
                >
                <Edit2 size={16} />
                </button>
                <button 
                onClick={() => onDelete(expense.id)}
                className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                title="Delete"
                >
                <Trash2 size={16} />
                </button>
            </div>
            </td>
        </tr>
    );
  };

  return (
    <div className="flex flex-col">
       {/* Header Toolbar */}
       <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
             <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Expense Breakdown</h3>
             <span className="text-sm text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
               {expenses.length} Item{expenses.length !== 1 && 's'}
             </span>
          </div>
          <button
             onClick={() => setIsGrouped(!isGrouped)}
             className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border
                ${isGrouped 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
             {isGrouped ? <List size={16} /> : <Layers size={16} />}
             {isGrouped ? 'Ungroup' : 'Group by Category'}
          </button>
       </div>

      <div className="overflow-x-auto bg-white dark:bg-slate-800">
        <table className="w-full min-w-[1300px] border-collapse">
            <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-900 z-20 w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                Expense Name
                </th>
                {!isGrouped && (
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">
                    Category
                    </th>
                )}
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">
                Freq
                </th>
                {SHORT_MONTHS.map((month, idx) => (
                <th 
                    key={month} 
                    className={`px-2 py-4 text-right text-xs font-semibold uppercase tracking-wider w-20 transition-colors
                    ${highlightedMonth === idx 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                        : 'text-slate-500 dark:text-slate-400'}`}
                >
                    {month}
                </th>
                ))}
                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky right-0 bg-slate-50 dark:bg-slate-900 z-20 w-24 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                Actions
                </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {expenses.length === 0 ? (
                <tr>
                <td colSpan={isGrouped ? 15 : 16} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    No expenses added yet. Click "Add Expense" to get started.
                </td>
                </tr>
            ) : isGrouped && groupedData ? (
                // Grouped Render
                Object.entries(groupedData).map(([category, items]) => {
                  const expenseList = items as Expense[];
                  const catTotals = getTotals(expenseList);
                  return (
                    <React.Fragment key={category}>
                        <tr className="bg-slate-50/80 dark:bg-slate-700/30 border-y border-slate-200 dark:border-slate-700">
                            <td colSpan={isGrouped ? 15 : 16} className="px-6 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 sticky left-0 z-10">
                                {category}
                            </td>
                        </tr>
                        {expenseList.map(renderExpenseRow)}
                        {/* Category Subtotal */}
                        <tr className="bg-slate-50/40 dark:bg-slate-800/50 font-semibold border-t border-dashed border-slate-200 dark:border-slate-700">
                            <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400 italic text-right sticky left-0 bg-slate-50/40 dark:bg-slate-800/50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                                {category} Total
                            </td>
                            <td className="px-4 py-3"></td>
                            {catTotals.map((total, idx) => (
                                <td key={idx} className="px-2 py-3 text-right text-sm text-slate-600 dark:text-slate-300">
                                    {total > 0 ? total.toLocaleString() : '-'}
                                </td>
                            ))}
                            <td className="sticky right-0 bg-slate-50/40 dark:bg-slate-800/50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.3)]"></td>
                        </tr>
                    </React.Fragment>
                  );
                })
            ) : (
                // Standard Render
                expenses.map(renderExpenseRow)
            )}
            
            {/* Grand Totals Row */}
            {expenses.length > 0 && (
                <tr className="bg-slate-100 dark:bg-slate-700/30 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white sticky left-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                    Grand Total
                </td>
                {!isGrouped && <td className="px-4 py-4"></td>}
                <td className="px-4 py-4"></td>
                {grandTotals.map((total, idx) => (
                    <td key={idx} className={`px-2 py-4 text-right text-sm text-slate-900 dark:text-white transition-colors ${highlightedMonth === idx ? 'bg-indigo-100/50 dark:bg-indigo-900/40' : ''}`}>
                    {total > 0 ? total.toLocaleString() : '-'}
                    </td>
                ))}
                <td className="sticky right-0 bg-slate-100 dark:bg-slate-800 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.3)]"></td>
                </tr>
            )}
            </tbody>
        </table>
      </div>
    </div>
  );
};