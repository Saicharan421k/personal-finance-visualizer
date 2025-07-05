// app/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { format, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { MonthlyExpensesChart } from "@/components/MonthlyExpensesChart";
import { BudgetDialog } from "@/components/BudgetDialog";
import { BudgetComparisonChart } from "@/components/BudgetComparisonChart";
import { SpendingInsights } from "@/components/SpendingInsights";

type ClientTransaction = { _id: string; amount: number; date: string; description: string; category: string; };
type ClientBudget = { _id:string; amount: number; category: string; month: string; };


const getLast12Months = () => {
  const months = [];
  let currentDate = new Date();
  for (let i = 0; i < 12; i++) {
    months.push(format(currentDate, "yyyy-MM"));
    currentDate = subMonths(currentDate, 1);
  }
  return months;
};

export default function DashboardPage() {
  const [allTransactions, setAllTransactions] = useState<ClientTransaction[]>([]);
  const [budgets, setBudgets] = useState<ClientBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [chartDateRange, setChartDateRange] = useState<DateRange | undefined>();
  const [viewedMonth, setViewedMonth] = useState(format(new Date(), "yyyy-MM"));

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`/api/budgets?month=${viewedMonth}`);
      if (!response.ok) throw new Error("Budget fetch failed");
      const budgetData = await response.json();
      if (budgetData.success) setBudgets(budgetData.data);
    } catch (error) { console.error("Failed to fetch budgets:", error); }
  };

  useEffect(() => {
    // THE FIX: Fetch data more resiliently, not inside a Promise.all
    async function fetchAllData() {
      setIsLoading(true);
      try {
        const transRes = await fetch("/api/transactions");
        if (!transRes.ok) throw new Error("Transaction fetch failed");
        const transData = await transRes.json();
        if (transData.success) setAllTransactions(transData.data);
      } catch (error) { console.error("Error fetching transactions:", error); }
      
      await fetchBudgets(); // Fetch budgets using the dedicated function
      setIsLoading(false);
    }
    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewedMonth]);

  const pieChartData = useMemo(() => {
    if (!chartDateRange?.from) return allTransactions;
    return allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= chartDateRange.from! && transactionDate <= (chartDateRange.to || chartDateRange.from!);
    });
  }, [allTransactions, chartDateRange]);

  const budgetComparisonData = useMemo(() => {
    const monthlyTransactions = allTransactions.filter(t => format(new Date(t.date), 'yyyy-MM') === viewedMonth);
    return budgets.map(budget => {
      const actualSpending = monthlyTransactions.filter(t => t.category === budget.category).reduce((sum, t) => sum + t.amount, 0);
      return { category: budget.category, budget: budget.amount, actual: actualSpending };
    }).filter(b => b.budget > 0 || b.actual > 0);
  }, [allTransactions, budgets, viewedMonth]);

  const totalLifetimeExpenses = allTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalLifetimeTransactions = allTransactions.length;
  const monthLabel = format(new Date(viewedMonth + "-02"), "MMMM yyyy");

  if (isLoading) {
    // A more descriptive loading state
    return <div className="container mx-auto p-8"><h1 className="text-2xl font-bold">Loading your financial dashboard...</h1></div>;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <main className="container mx-auto p-4 py-8 md:p-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Displaying budgets and insights for: {monthLabel}</p>
          </div>
          <BudgetDialog month={viewedMonth} onBudgetSet={fetchBudgets} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1"><Card className="h-full"><CardHeader><CardTitle>Add a Transaction</CardTitle></CardHeader><CardContent><TransactionForm /></CardContent></Card></div>
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div><CardTitle>Category Breakdown</CardTitle><CardDescription>Spending by category.</CardDescription></div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="date" variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !chartDateRange && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {chartDateRange?.from ? (chartDateRange.to ? (<>{format(chartDateRange.from, "LLL dd, y")} - {format(chartDateRange.to, "LLL dd, y")}</>) : (format(chartDateRange.from, "LLL dd, y"))) : (<span>All Transactions</span>)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end"><Calendar initialFocus mode="range" selected={chartDateRange} onSelect={setChartDateRange} numberOfMonths={2} /></PopoverContent>
                </Popover>
              </CardHeader>
              <CardContent className="h-[300px]"><CategoryPieChart data={pieChartData} /></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div><CardTitle>Budget vs. Actual</CardTitle><CardDescription>Spending for the selected month.</CardDescription></div>
                <Select value={viewedMonth} onValueChange={setViewedMonth}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Select Month" /></SelectTrigger>
                  <SelectContent>{getLast12Months().map(m => <SelectItem key={m} value={m}>{format(new Date(m + "-02"), "MMM yyyy")}</SelectItem>)}</SelectContent>
                </Select>
              </CardHeader>
              <CardContent><BudgetComparisonChart data={budgetComparisonData} /></CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader><CardTitle>All-Time Stats</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><p className="text-sm text-muted-foreground">Total Lifetime Expenses</p><p className="text-2xl font-bold">${totalLifetimeExpenses.toFixed(2)}</p></div>
                <div><p className="text-sm text-muted-foreground">Total Lifetime Transactions</p><p className="text-2xl font-bold">{totalLifetimeTransactions}</p></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Spending Insights</CardTitle><CardDescription>For {monthLabel}</CardDescription></CardHeader>
              <CardContent><SpendingInsights data={budgetComparisonData} /></CardContent>
            </Card>
          </div>
        </div>
        
        {/* THE FIX: Bar graph is restored here */}
        <div className="mt-8">
          <MonthlyExpensesChart data={allTransactions} />
        </div>

        <div className="mt-8"><Card><CardHeader><CardTitle>Full Transaction History</CardTitle></CardHeader><CardContent><TransactionList initialTransactions={allTransactions} /></CardContent></Card></div>
      </main>
    </div>
  );
}
