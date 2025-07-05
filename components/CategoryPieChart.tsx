// components/CategoryPieChart.tsx
"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// This type is now only used inside this component and is fine.
type ChartTransactionProp = {
  amount: number;
  category: string;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d', '#4dff88', '#ffc61a'];

// The props are now much simpler: it just needs the data.
export function CategoryPieChart({ data }: { data: ChartTransactionProp[] }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const categoryTotals = data.reduce((acc, transaction) => {
      const { category, amount } = transaction;
      if (!acc[category]) acc[category] = 0;
      acc[category] += amount;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [data]);

  // The return is now just the chart or the empty state placeholder.
  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-sm text-muted-foreground">No data for selected period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip
          cursor={{ fill: 'transparent' }}
          contentStyle={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
            // Guard clause to prevent errors with undefined values from the library
            if (percent === undefined || midAngle === undefined || cx === undefined || cy === undefined || innerRadius === undefined || outerRadius === undefined) {
              return null;
            }
            if (percent < 0.05) {
              return null;
            }
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            return (
              <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend wrapperStyle={{ fontSize: "12px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}