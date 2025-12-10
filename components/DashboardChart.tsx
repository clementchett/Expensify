import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Legend, Area } from 'recharts';
import { MonthlyData } from '../types';

interface DashboardChartProps {
  data: MonthlyData[];
  isDarkMode: boolean;
  onMonthClick: (index: number) => void;
  selectedMonthIndex: number | null;
  monthlyIncome?: number; // Kept for backward compatibility if needed, though we use data.income now
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ data, isDarkMode, onMonthClick, selectedMonthIndex }) => {
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? '#1e293b' : '#fff';
  const tooltipText = isDarkMode ? '#f1f5f9' : '#0f172a';
  
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart 
          data={data} 
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          onClick={(data) => {
            if (data && data.activeTooltipIndex !== undefined) {
              onMonthClick(data.activeTooltipIndex);
            }
          }}
          className="cursor-pointer"
        >
          <defs>
             <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
             </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: textColor, fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: textColor, fontSize: 12 }}
            tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
          />
          <Tooltip 
            cursor={{ fill: isDarkMode ? '#334155' : '#f1f5f9' }}
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              backgroundColor: tooltipBg,
              color: tooltipText
            }}
            itemStyle={{ color: tooltipText }}
            formatter={(value: number, name: string) => {
                const label = name === 'income' ? 'Income' : name === 'expense' ? 'Expenses' : name;
                return [`₹${value.toLocaleString()}`, label];
            }}
          />
          <Legend iconType="circle" />
          
          {/* Income Area/Line */}
          <Area 
            type="monotone" 
            dataKey="income" 
            name="Income"
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorIncome)" 
            strokeWidth={2}
          />

          {/* Expense Bar */}
          <Bar 
            dataKey="expense" 
            name="Expenses"
            radius={[4, 4, 0, 0]} 
            barSize={20}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.expense > entry.income ? '#ef4444' : (selectedMonthIndex === index ? '#4f46e5' : '#6366f1')} 
                fillOpacity={selectedMonthIndex === null || selectedMonthIndex === index ? 1 : 0.6}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
