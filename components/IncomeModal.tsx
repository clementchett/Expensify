import React, { useState } from 'react';
import { MONTHS } from '../constants';
import { X, Save, IndianRupee } from 'lucide-react';

interface IncomeModalProps {
  currentIncomes: number[];
  onSave: (incomes: number[]) => void;
  onClose: () => void;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({ currentIncomes, onSave, onClose }) => {
  const [incomes, setIncomes] = useState<string[]>(
    currentIncomes.map(val => val === 0 ? '' : val.toString())
  );

  const handleChange = (index: number, value: string) => {
    const newIncomes = [...incomes];
    newIncomes[index] = value;
    setIncomes(newIncomes);
  };

  const handleApplyToAll = () => {
    const firstValue = incomes[0];
    setIncomes(new Array(12).fill(firstValue));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericIncomes = incomes.map(val => {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    });
    onSave(numericIncomes);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all border dark:border-slate-700 flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 dark:bg-slate-950 px-6 py-4 flex justify-between items-center border-b dark:border-slate-800 flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <IndianRupee size={20} />
            Edit Monthly Income
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center justify-between">
             <p className="text-sm text-blue-700 dark:text-blue-300">
               Enter your expected income for each month.
             </p>
             <button 
               type="button"
               onClick={handleApplyToAll}
               className="text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-3 py-1.5 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
             >
               Copy Jan to All
             </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {MONTHS.map((month, index) => (
              <div key={month}>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                  {month}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">₹</span>
                  <input
                    type="number"
                    value={incomes[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white dark:bg-slate-700 dark:text-white placeholder-slate-300 dark:placeholder-slate-600"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </form>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition-colors shadow-lg shadow-primary/30 flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
