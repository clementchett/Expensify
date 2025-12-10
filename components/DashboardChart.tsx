import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine, Label } from 'recharts';
import { MonthlyData } from '../types';

interface DashboardChartProps {
  data: MonthlyData[];
  isDarkMode: boolean;
  onMonthClick: (index: number) => void;
  selectedMonthIndex: number | null;
  monthlyIncome: number;
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ data, isDarkMode, onMonthClick, selectedMonthIndex, monthlyIncome }) => {
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? '#1e293b' : '#fff';
  const tooltipText = isDarkMode ? '#f1f5f9' : '#0f172a';
  const incomeLineColor = isDarkMode ? '#34d399' : '#059669'; // Emerald-400 / Emerald-600

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          onClick={(data) => {
            if (data && data.activeTooltipIndex !== undefined) {
              onMonthClick(data.activeTooltipIndex);
            }
          }}
          className="cursor-pointer"
        >
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
            tickFormatter={(value) => `₹${value}`}
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
            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Expenses']}
          />
          {monthlyIncome > 0 && (
            <ReferenceLine y={monthlyIncome} stroke={incomeLineColor} strokeDasharray="3 3" strokeWidth={2}>
              <Label 
                value="Income" 
                position="insideTopRight" 
                fill={incomeLineColor} 
                fontSize={12} 
                fontWeight={500}
                offset={10}
              />
            </ReferenceLine>
          )}
          <Bar 
            dataKey="total" 
            radius={[4, 4, 0, 0]} 
            barSize={32}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={selectedMonthIndex === index ? '#4f46e5' : '#6366f1'} 
                fillOpacity={selectedMonthIndex === null || selectedMonthIndex === index ? 1 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
