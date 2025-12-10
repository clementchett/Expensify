import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Expense, MonthlyData } from './types';
import { SHORT_MONTHS, CATEGORIES, CATEGORY_COLORS } from './constants';
import { ExpenseTable } from './components/ExpenseTable';
import { ExpenseForm } from './components/ExpenseForm';
import { DashboardChart } from './components/DashboardChart';
import { CategoryChart } from './components/CategoryChart';
import { calculateMonthlyDistribution, formatCurrency, calculateTotalAnnual } from './services/expenseUtils';
import { analyzeExpenses } from './services/geminiService';
import { Plus, Wallet, TrendingUp, Sparkles, Loader2, Moon, Sun, Info, PiggyBank, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  
  // Custom Categories State
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customCategories');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Monthly Income State
  const [monthlyIncome, setMonthlyIncome] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('monthlyIncome') || '';
    }
    return '';
  });

  const allCategories = useMemo(() => {
    // Combine default and custom categories, ensuring uniqueness
    return Array.from(new Set([...CATEGORIES, ...customCategories]));
  }, [customCategories]);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Apply Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Save custom categories
  useEffect(() => {
    localStorage.setItem('customCategories', JSON.stringify(customCategories));
  }, [customCategories]);

  // Save monthly income
  useEffect(() => {
    localStorage.setItem('monthlyIncome', monthlyIncome);
  }, [monthlyIncome]);

  // Load from LocalStorage and Migrate Data if needed
  useEffect(() => {
    const saved = localStorage.getItem('expenses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Simple migration to ensure all expenses have a category
        const migrated = parsed.map((e: any) => ({
          ...e,
          category: e.category || CATEGORIES[CATEGORIES.length - 1] // Default to 'Miscellaneous'
        }));
        setExpenses(migrated);
      } catch (e) {
        console.error("Failed to parse expenses", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleSaveExpense = (expense: Expense) => {
    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === expense.id ? expense : e));
    } else {
      setExpenses([...expenses, expense]);
    }
    setIsFormOpen(false);
    setEditingExpense(null);
    setAiAnalysis(null); // Clear analysis on data change
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(e => e.id !== id));
      setAiAnalysis(null);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleAddCategory = (newCategory: string) => {
    if (!allCategories.includes(newCategory)) {
      setCustomCategories([...customCategories, newCategory]);
    }
  };

  const handleAIAnalysis = async () => {
    if (expenses.length === 0) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const result = await analyzeExpenses(expenses);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleMonthClick = (index: number) => {
    if (selectedMonthIndex === index) {
      setSelectedMonthIndex(null); // Toggle off
    } else {
      setSelectedMonthIndex(index);
    }
  };

  // Memoized calculations for dashboard
  const monthlyData: MonthlyData[] = useMemo(() => {
    const data = new Array(12).fill(0);
    expenses.forEach(e => {
      const dist = calculateMonthlyDistribution(e);
      dist.forEach((amt, idx) => data[idx] += amt);
    });
    return SHORT_MONTHS.map((month, idx) => ({
      month,
      total: data[idx]
    }));
  }, [expenses]);

  const totalAnnual = useMemo(() => monthlyData.reduce((acc, curr) => acc + curr.total, 0), [monthlyData]);
  const parsedIncome = parseFloat(monthlyIncome) || 0;
  const annualIncome = parsedIncome * 12;
  const annualBalance = annualIncome - totalAnnual;
  const savingsRate = annualIncome > 0 ? ((annualBalance / annualIncome) * 100) : 0;

  // Calculate Category Data
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(e => {
      const total = calculateTotalAnnual(e);
      if (categoryTotals[e.category]) {
        categoryTotals[e.category] += total;
      } else {
        categoryTotals[e.category] = total;
      }
    });

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  return (
    <div className="min-h-screen pb-12 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Wallet className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Expensify 360</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-slate-900/20 dark:shadow-primary/20"
            >
              <Plus size={18} />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {/* Income Input Card */}
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200 flex flex-col justify-between">
             <div className="flex items-start justify-between mb-2">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                  <ArrowUpCircle className="text-emerald-600 dark:text-emerald-400 h-6 w-6" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md">
                   Annual: {formatCurrency(annualIncome)}
                </span>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Monthly Income</label>
               <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium">₹</span>
                 <input 
                   type="number"
                   value={monthlyIncome}
                   onChange={(e) => setMonthlyIncome(e.target.value)}
                   className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                   placeholder="0"
                 />
               </div>
             </div>
           </div>

          {/* Expenses Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">
                <ArrowDownCircle className="text-red-600 dark:text-red-400 h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Annual Expenses</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalAnnual)}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Avg. {formatCurrency(totalAnnual/12)} / month</p>
            </div>
          </div>
          
          {/* Balance Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200 flex flex-col justify-between">
             <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${annualBalance >= 0 ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-orange-50 dark:bg-orange-900/30'}`}>
                <PiggyBank className={`h-6 w-6 ${annualBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`} />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Annual Balance</p>
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${annualBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {annualBalance >= 0 ? '+' : ''}{formatCurrency(annualBalance)}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                 {parsedIncome > 0 ? `${savingsRate.toFixed(1)}% savings rate` : 'Set income to calculate savings'}
              </p>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group flex flex-col justify-between">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles size={64} />
             </div>
             <div className="relative z-10">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles size={18} /> AI Insights
                </h3>
                <p className="text-indigo-100 text-sm mt-1">
                  Get smart analysis of your spending habits.
                </p>
             </div>
             <button 
               onClick={handleAIAnalysis}
               disabled={isAnalyzing || expenses.length === 0}
               className="mt-4 w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isAnalyzing ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
               {isAnalyzing ? 'Analyzing...' : 'Analyze Budget'}
             </button>
          </div>
        </div>

        {/* AI Analysis Result */}
        {aiAnalysis && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-sm p-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles className="text-indigo-600 dark:text-indigo-400 h-5 w-5" />
              Financial Analysis
            </h3>
            <div className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-600 dark:text-slate-300">
               <pre className="whitespace-pre-wrap font-sans">{aiAnalysis}</pre>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Bar Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Expenditure Overview</h3>
               {selectedMonthIndex !== null && (
                 <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded flex items-center gap-1">
                   <Info size={12}/> Highlighting {SHORT_MONTHS[selectedMonthIndex]}
                 </span>
               )}
            </div>
            <DashboardChart 
              data={monthlyData} 
              isDarkMode={isDarkMode} 
              onMonthClick={handleMonthClick}
              selectedMonthIndex={selectedMonthIndex}
              monthlyIncome={parsedIncome}
            />
            <p className="text-xs text-center text-slate-400 mt-4">
               {parsedIncome > 0 ? 'Dashed line indicates monthly income limit. ' : ''}
               Click on a bar to highlight that month in the table below.
            </p>
          </div>

          {/* Category Pie Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Category Breakdown</h3>
            <div className="flex-1 flex items-center">
              <CategoryChart data={categoryData} isDarkMode={isDarkMode} />
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-200">
            {/* Table wrapper handles its own header area now with grouping toggle */}
            <ExpenseTable 
              expenses={expenses} 
              onEdit={handleEditExpense} 
              onDelete={handleDeleteExpense} 
              highlightedMonth={selectedMonthIndex}
            />
          </div>
        </div>
      </main>

      {/* Modal */}
      {isFormOpen && (
        <ExpenseForm 
          initialData={editingExpense} 
          categories={allCategories}
          onAddCategory={handleAddCategory}
          onSave={handleSaveExpense} 
          onCancel={() => {
            setIsFormOpen(false);
            setEditingExpense(null);
          }} 
        />
      )}
    </div>
  );
};

export default App;
