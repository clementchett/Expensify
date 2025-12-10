import React, { useState, useEffect } from 'react';
import { Expense, Frequency } from '../types';
import { MONTHS } from '../constants';
import { Plus, Save, X, Check } from 'lucide-react';

interface ExpenseFormProps {
  initialData?: Expense | null;
  categories: string[];
  onAddCategory: (category: string) => void;
  onSave: (expense: Expense) => void;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, categories, onAddCategory, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [frequency, setFrequency] = useState<Frequency>(Frequency.MONTHLY);
  const [specificMonth, setSpecificMonth] = useState<number | null>(null);
  const [error, setError] = useState('');
  
  // Custom category UI state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setAmount(initialData.amount.toString());
      setFrequency(initialData.frequency);
      setSpecificMonth(initialData.specificMonth ?? null);
    } else {
        // Default category
        if (categories.length > 0) setCategory(categories[0]);
    }
  }, [initialData, categories]);

  // Ensure category is selected if not already
  useEffect(() => {
    if (!category && categories.length > 0) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Expense name is required');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    const newExpense: Expense = {
      id: initialData?.id || crypto.randomUUID(),
      name,
      category,
      amount: Number(amount),
      frequency,
      specificMonth: (specificMonth === -1) ? null : specificMonth
    };

    onSave(newExpense);
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
        const formatted = newCategoryName.trim();
        onAddCategory(formatted);
        setCategory(formatted);
        setNewCategoryName('');
        setIsAddingCategory(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border dark:border-slate-700">
        <div className="bg-slate-900 dark:bg-slate-950 px-6 py-4 flex justify-between items-center border-b dark:border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {initialData ? <Save size={20} /> : <Plus size={20} />}
            {initialData ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expense Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
              placeholder="e.g., House Rent, Internet Bill"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              {isAddingCategory ? (
                 <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={newCategoryName}
                       onChange={(e) => setNewCategoryName(e.target.value)}
                       placeholder="New Category"
                       className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm bg-white dark:bg-slate-700 dark:text-white"
                       onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewCategory())}
                     />
                     <button type="button" onClick={handleAddNewCategory} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"><Check size={16} /></button>
                     <button type="button" onClick={() => setIsAddingCategory(false)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><X size={16} /></button>
                 </div>
              ) : (
                <div className="flex gap-2">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white dark:bg-slate-700 dark:text-white"
                    >
                        {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button 
                        type="button" 
                        onClick={() => setIsAddingCategory(true)}
                        className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        title="Add Custom Category"
                    >
                        <Plus size={18} />
                    </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white dark:bg-slate-700 dark:text-white"
              >
                {Object.values(Frequency).map((freq) => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Starts In / Month</label>
              <select
                value={specificMonth ?? -1}
                onChange={(e) => setSpecificMonth(Number(e.target.value) === -1 ? null : Number(e.target.value))}
                className={`w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white dark:bg-slate-700 dark:text-white ${frequency === Frequency.MONTHLY ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={frequency === Frequency.MONTHLY}
              >
                <option value={-1}>Default (Jan)</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition-colors shadow-lg shadow-primary/30"
            >
              {initialData ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
