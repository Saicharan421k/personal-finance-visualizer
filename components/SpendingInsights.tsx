// components/SpendingInsights.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, Wallet } from "lucide-react";

type InsightData = {
  category: string;
  budget: number;
  actual: number;
};

type Insight = {
  type: "destructive" | "warning";
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function SpendingInsights({ data }: { data: InsightData[] }) {
  const insights: Insight[] = data.map(item => {
    const overspent = item.actual > item.budget;
    const nearingLimit = !overspent && item.budget > 0 && item.actual / item.budget >= 0.9;
    
    if (overspent) {
      return {
        type: "destructive",
        title: `Over Budget in ${item.category}`,
        description: `You have spent $${(item.actual - item.budget).toFixed(2)} more than your budget.`,
        icon: <AlertCircle className="h-4 w-4" />
      };
    }
    if (nearingLimit) {
      return {
        type: "warning",
        title: `Nearing Budget in ${item.category}`,
        description: `You have spent over 90% of your budget. $${(item.budget - item.actual).toFixed(2)} remaining.`,
        icon: <TrendingUp className="h-4 w-4" />
      };
    }
    return null;
  }).filter(Boolean) as Insight[];

  if (insights.length === 0) {
    return (
      <Alert>
        <Wallet className="h-4 w-4" />
        <AlertTitle>All Good!</AlertTitle>
        {/* THIS IS THE ONLY LINE THAT MATTERS FOR THE ERROR. IT MUST BE EXACTLY LIKE THIS. */}
        <AlertDescription>You are staying within your budget limits for all categories.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
      {insights.map((insight, index) => (
        <Alert key={index} variant={insight.type}>
          {insight.icon}
          <AlertTitle>{insight.title}</AlertTitle>
          <AlertDescription>{insight.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
