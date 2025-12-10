import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryChartProps {
  data: CategoryData[];
  isDarkMode: boolean;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ data, isDarkMode }) => {
  const tooltipBg = isDarkMode ? '#1e293b' : '#fff';
  const tooltipText = isDarkMode ? '#f1f5f9' : '#0f172a';
  const legendColor = isDarkMode ? '#94a3b8' : '#64748b';

  if (data.length === 0) {
      return (
          <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
              No data to display
          </div>
      );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              backgroundColor: tooltipBg,
              color: tooltipText
            }}
            itemStyle={{ color: tooltipText }}
            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Total']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => <span style={{ color: legendColor, fontSize: '12px', fontWeight: 500 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
