// components/MonthlyExpensesChart.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
// ... (other imports) ...

type ChartTransactionProp = { amount: number; date: string; };

// THE FIX: Define a proper type for the tooltip props
type CustomTooltipProps = {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="font-bold text-sm mb-1">{label}</p>
        <p className="text-sm">Total: ${value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export function MonthlyExpensesChart({ data }: { data: ChartTransactionProp[] }) {
  const [date, setDate] = useState<DateRange | undefined>();

  const filteredData = useMemo(() => {
    if (!date?.from) return data;
    return data.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= date.from! && transactionDate <= (date.to || date.from!);
    });
  }, [data, date]);

  const monthlyData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    const monthTotals = filteredData.reduce((acc, transaction) => {
      const month = format(new Date(transaction.date), "MMM yyyy");
      if (!acc[month]) acc[month] = 0;
      acc[month] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(monthTotals).map(([name, total]) => ({ name, total })).reverse();
  }, [filteredData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Monthly Expense Overview</CardTitle>
          <CardDescription>Bar chart showing total expenses per month.</CardDescription>
        </div>
        <Popover>
            <PopoverTrigger asChild>
              <Button id="date" variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (date.to ? (<>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>) : (format(date.from, "LLL dd, y")) ) : (<span>Pick a date range</span>)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
            </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip cursor={false} content={<CustomTooltip />} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} activeBar={{ fill: 'hsl(var(--primary) / 0.9)' }} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] w-full items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-sm text-muted-foreground">No data for the selected period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
