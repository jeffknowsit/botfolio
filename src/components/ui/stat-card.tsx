
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { GlassCard } from "./glass-card";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: number;
  suffix?: string;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  suffix = "", 
  className, 
  ...props 
}: StatCardProps) {
  const isPositive = change && change > 0;
  
  return (
    <GlassCard
      className={cn("p-4 min-h-[120px] flex flex-col justify-between", className)}
      {...props}
    >
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-2xl font-bold">
          {value}
          {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
        </div>
        {typeof change !== "undefined" && (
          <div 
            className={cn(
              "flex items-center text-sm",
              isPositive ? "text-green-500" : "text-red-500"
            )}
          >
            {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
