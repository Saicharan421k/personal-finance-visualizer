// components/SpendingInsights.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, Wallet } from "lucide-react";

type InsightData = {
  category: string;
  budget: number;
  actual: number;
};

export function SpendingInsights({ data }: { data: InsightData[] }) {
  const insights = data.map(item => {
    const overspent = item.actual > item.budget;
    // Ensure budget is > 0 to avoid division by zero and false positives on 90%
    const nearingLimit = !overspent && item.budget > 0 && item.actual / item.budget >= 0.9;

    if (overspent) {
      return {
        type: "destructive",
        title: `Over Budget in ${item.category}`,
        description: `You've spent $${(item.actual - item.budget).toFixed(2)} more than your budget.`,
        icon: <AlertCircle className="h-4 w-4" />
      };
    }
    if (nearingLimit) {
      return {
        type: "warning",
        title: `Nearing Budget in ${item.category}`,
        description: `You've spent over 90% of your budget. $${(item.budget - item.actual).toFixed(2)} remaining.`,
        icon: <TrendingUp className="h-4 w-4" />
      };
    }
    return null;
  }).filter(Boolean);

  if (insights.length === 0) {
    return (
      <Alert>
        <Wallet className="h-4 w-4" />
        <AlertTitle>All Good!</AlertTitle>
        <AlertDescription>You're staying within your budget limits for all categories.</AlertDescription>
      </Alert>
    );
  }

  // THE FIX: The `max-h-[200px]` and `overflow-y-auto` classes create a scrollable container.
  return (
    <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
      {insights.map((insight, index) => (
        <Alert key={index} variant={insight!.type as any}>
          {insight!.icon}
          <AlertTitle>{insight!.title}</AlertTitle>
          <AlertDescription>{insight!.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}