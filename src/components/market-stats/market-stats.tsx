
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
} from "recharts";
import { DetailedChart } from "./detailed-chart";
import { ExternalLink } from "lucide-react";

// Mock data with candlestick pattern like in the image
const generateMarketData = (baseValue: number, isUptrend: boolean) => {
  const data = [];
  let currentValue = baseValue;
  
  for (let i = 0; i < 30; i++) {
    // Create more volatile movements like in the example image
    const volatility = Math.random() * 80 + 40;
    const direction = (Math.random() > 0.45 ? 1 : -1) * (isUptrend ? 1.2 : -0.8);
    currentValue = currentValue + direction * volatility * Math.random();
    
    data.push({
      date: i,
      value: parseFloat(currentValue.toFixed(2)),
    });
  }
  
  return data;
};

// Generate data for NIFTY and SENSEX
const niftyData = generateMarketData(22400, true);
const sensexData = generateMarketData(61200, false);

export function MarketStats() {
  const [detailedView, setDetailedView] = useState<"NIFTY 50" | "SENSEX" | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCardWithChart
          title="NIFTY 50"
          value="22,420.40"
          change={1.2}
          data={niftyData}
          lineColor="#10b981" // Green color for uptrend
          onViewDetails={() => setDetailedView("NIFTY 50")}
        />
        <StatCardWithChart
          title="SENSEX"
          value="61,872.64"
          change={-0.8}
          data={sensexData}
          lineColor="#ef4444" // Red color for downtrend
          onViewDetails={() => setDetailedView("SENSEX")}
        />
      </div>
      {detailedView && (
        <DetailedChart symbol={detailedView} onClose={() => setDetailedView(null)} />
      )}
    </>
  );
}

interface StatCardWithChartProps {
  title: string;
  value: string;
  change: number;
  data: { value: number }[];
  lineColor: string;
  onViewDetails: () => void;
}

function StatCardWithChart({
  title,
  value,
  change,
  data,
  lineColor,
  onViewDetails,
}: StatCardWithChartProps) {
  const isPositive = change > 0;

  return (
    <Card 
      className="glass-card overflow-hidden border-white/10 backdrop-blur-xl neon-border hover:shadow-lg transition-shadow duration-300 cursor-pointer group" 
      onClick={onViewDetails}
    >
      <CardContent className="p-0">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">{value}</p>
                <span
                  className={`text-sm font-medium ${
                    isPositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {change}%
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="bg-primary/20 px-3 py-1 rounded-full text-xs text-primary animate-pulse-slow">
                Live
              </div>
              <ExternalLink size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              {isPositive ? (
                <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`color${title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={lineColor} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={lineColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide={true} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1625",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={lineColor}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#color${title})`}
                    dot={false}
                  />
                </AreaChart>
              ) : (
                <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1625",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={lineColor}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
