
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// Mock data
const niftyData = [
  { value: 18250 },
  { value: 18300 },
  { value: 18400 },
  { value: 18380 },
  { value: 18450 },
  { value: 18500 },
  { value: 18510 },
  { value: 18550 },
  { value: 18600 },
  { value: 18650 },
  { value: 18700 },
];

const sensexData = [
  { value: 61200 },
  { value: 61300 },
  { value: 61350 },
  { value: 61500 },
  { value: 61450 },
  { value: 61550 },
  { value: 61600 },
  { value: 61650 },
  { value: 61700 },
  { value: 61750 },
  { value: 61800 },
];

export function MarketStats() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <StatCardWithChart
        title="NIFTY 50"
        value="18,756.15"
        change={1.2}
        data={niftyData}
        lineColor="#8b5cf6"
      />
      <StatCardWithChart
        title="SENSEX"
        value="61,872.64"
        change={0.8}
        data={sensexData}
        lineColor="#06b6d4"
      />
    </div>
  );
}

interface StatCardWithChartProps {
  title: string;
  value: string;
  change: number;
  data: { value: number }[];
  lineColor: string;
}

function StatCardWithChart({
  title,
  value,
  change,
  data,
  lineColor,
}: StatCardWithChartProps) {
  const isPositive = change > 0;

  return (
    <Card className="glass-card overflow-hidden border-white/10 backdrop-blur-xl neon-border">
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
                  {isPositive ? "+" : "-"}
                  {Math.abs(change)}%
                </span>
              </div>
            </div>
            <div className="bg-primary/20 px-3 py-1 rounded-full text-xs text-primary animate-pulse-slow">
              Live
            </div>
          </div>
          
          <div className="h-24 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
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
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
