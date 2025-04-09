
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock portfolio data
const portfolioItems = [
  {
    id: 1,
    name: "AAPL",
    price: 172.64,
    change: 1.23,
    chartData: [35, 41, 37, 45, 46, 42, 47, 49],
    color: "#34d399",
  },
  {
    id: 2,
    name: "MSFT",
    price: 374.19,
    change: -0.65,
    chartData: [60, 55, 58, 62, 59, 54, 52, 50],
    color: "#f43f5e",
  },
  {
    id: 3,
    name: "TSLA",
    price: 253.18,
    change: 2.85,
    chartData: [35, 30, 45, 40, 50, 46, 55, 60],
    color: "#34d399",
  },
];

export function PortfolioOverview() {
  return (
    <Card className="glass-card h-full border-white/10">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold">Your Portfolio</h3>
          <button className="text-xs text-primary hover:underline">View All</button>
        </div>
        <div className="space-y-4">
          {portfolioItems.map((stock) => (
            <StockCard
              key={stock.id}
              name={stock.name}
              price={stock.price}
              change={stock.change}
              chartData={stock.chartData}
              color={stock.color}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface StockCardProps {
  name: string;
  price: number;
  change: number;
  chartData: number[];
  color: string;
}

function StockCard({ name, price, change, chartData, color }: StockCardProps) {
  const isPositive = change > 0;

  return (
    <div className="p-4 rounded-lg bg-black/20 hover:bg-black/30 transition cursor-pointer">
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold">{name}</div>
        <div
          className={cn(
            "flex items-center text-xs",
            isPositive ? "text-green-500" : "text-red-500"
          )}
        >
          {isPositive ? (
            <TrendingUp size={14} className="mr-1" />
          ) : (
            <TrendingDown size={14} className="mr-1" />
          )}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-lg">${price.toFixed(2)}</div>
        <div className="flex items-baseline h-8">
          {chartData.map((value, i) => (
            <div
              key={i}
              className="mx-px w-1 rounded-t"
              style={{
                height: `${value}%`,
                backgroundColor: color,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
