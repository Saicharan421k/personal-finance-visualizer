// components/BudgetComparisonChart.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';

type ChartData = { category: string; budget: number; actual: number; };

// THE FIX: Define a proper type for the tooltip props
type CustomTooltipProps = {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  primaryColor?: string;
  mutedColor?: string;
}

const CustomTooltip = ({ active, payload, label, primaryColor, mutedColor }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="font-bold text-sm mb-1">{label}</p>
        <p className="text-sm" style={{ color: mutedColor }}>Budget: ${payload[0].value.toFixed(2)}</p>
        <p className="text-sm" style={{ color: primaryColor }}>Actual: ${payload[1].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export function BudgetComparisonChart({ data }: { data: ChartData[] }) {
  // 1. STATE TO HOLD THE COMPUTED THEME COLORS
  // We provide default fallbacks just in case.
  const [primaryColor, setPrimaryColor] = useState("#3b82f6"); // A default blue
  const [mutedColor, setMutedColor] = useState("#a1a1aa");   // A default grey

  // 2. USEEFFECT TO READ CSS VARIABLES FROM THE DOM ONCE THE COMPONENT MOUNTS
  useEffect(() => {
    // This code runs only in the browser, after the component has mounted
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryVal = computedStyle.getPropertyValue('--primary').trim();
    const mutedVal = computedStyle.getPropertyValue('--muted-foreground').trim();
    
    // Set the state with the actual HSL values from our theme
    setPrimaryColor(`hsl(${primaryVal})`);
    setMutedColor(`hsl(${mutedVal})`);
  }, []); // The empty array ensures this effect runs only once

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-sm text-muted-foreground">Set a budget to see comparison.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <XAxis dataKey="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
        
        {/* Pass the computed colors to the tooltip */}
        <Tooltip content={<CustomTooltip primaryColor={primaryColor} mutedColor={mutedColor} />} cursor={false} />
        
        <Legend wrapperStyle={{ fontSize: "12px" }}/>
        
        {/* 3. USE THE STATE VARIABLES (PLAIN COLOR STRINGS) FOR THE FILL PROP */}
        <Bar 
            dataKey="budget" 
            fill={mutedColor} // Use the state variable for the color
            fillOpacity={0.4}  // Use fillOpacity for transparency
            radius={[4, 4, 0, 0]} 
            activeBar={{ fill: mutedColor, fillOpacity: 0.6 }} 
        />
        
        <Bar 
            dataKey="actual" 
            fill={primaryColor} // Use the state variable for the color
            radius={[4, 4, 0, 0]} 
            activeBar={{ fill: primaryColor, fillOpacity: 0.8 }} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
