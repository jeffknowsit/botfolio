
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { ChevronLeft, Download, Share2, TrendingUp, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetailedChartProps {
  symbol: string;
  onClose: () => void;
}

// Mock historical data for the chart
const generateHistoricalData = (base: number, points: number) => {
  const data = [];
  let currentValue = base;
  
  // Generate historical data for the past 30 days
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Random fluctuation around the base value
    currentValue = currentValue + (Math.random() - 0.5) * 100;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: currentValue.toFixed(2),
    });
  }
  
  return data;
};

export function DetailedChart({ symbol, onClose }: DetailedChartProps) {
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "All">("1M");
  const [chartType, setChartType] = useState<"line" | "area">("area");
  
  // Mock data based on symbol
  const baseValue = symbol === "NIFTY 50" ? 18700 : 61800;
  const historicalData = generateHistoricalData(baseValue, 30);
  const currentValue = parseFloat(historicalData[historicalData.length - 1].value);
  const previousValue = parseFloat(historicalData[historicalData.length - 2].value);
  const changePercent = (((currentValue - previousValue) / previousValue) * 100).toFixed(2);
  const isPositive = Number(changePercent) >= 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto glass-card border-white/10">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ChevronLeft />
              </Button>
              <div>
                <h2 className="text-2xl font-bold">{symbol}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">
                    {currentValue.toLocaleString()}
                  </span>
                  <span className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? "+" : ""}{changePercent}%
                    <TrendingUp className={`inline ml-1 ${isPositive ? "" : "rotate-180"}`} size={14} />
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Search className="mr-1" size={14} />
                Compare
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-1" size={14} />
                Indicators
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-1" size={14} />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-1" size={14} />
                Export
              </Button>
            </div>
          </div>
          
          <div className="mb-4 flex items-center justify-between">
            <div className="flex space-x-2">
              {["1D", "1W", "1M", "3M", "1Y", "All"].map((range) => (
                <Button 
                  key={range}
                  size="sm"
                  variant={timeRange === range ? "default" : "outline"}
                  onClick={() => setTimeRange(range as any)}
                  className={timeRange === range ? "bg-primary" : ""}
                >
                  {range}
                </Button>
              ))}
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm"
                variant={chartType === "line" ? "default" : "outline"}
                onClick={() => setChartType("line")}
                className={chartType === "line" ? "bg-primary" : ""}
              >
                Line
              </Button>
              <Button 
                size="sm"
                variant={chartType === "area" ? "default" : "outline"}
                onClick={() => setChartType("area")}
                className={chartType === "area" ? "bg-primary" : ""}
              >
                Area
              </Button>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart
                  data={historicalData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    tick={{ fill: '#ccc' }}
                  />
                  <YAxis 
                    stroke="#888" 
                    tick={{ fill: '#ccc' }}
                    domain={['dataMin - 100', 'dataMax + 100']}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={isPositive ? "#10b981" : "#ef4444"} 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <AreaChart
                  data={historicalData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    tick={{ fill: '#ccc' }}
                  />
                  <YAxis 
                    stroke="#888" 
                    tick={{ fill: '#ccc' }}
                    domain={['dataMin - 100', 'dataMax + 100']}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={isPositive ? "#10b981" : "#ef4444"} 
                    fill={isPositive ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"} 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">AI Prediction</h3>
            <div className="bg-black/30 border border-white/10 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Prediction confidence</span>
                <span className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {Math.floor(Math.random() * 30) + 70}%
                </span>
              </div>
              <p className="text-sm">
                Based on historical patterns and current market conditions, {symbol} is expected to 
                {isPositive ? " continue its upward trend over the next 24-48 hours. Volume indicators suggest strong buying interest." : " face resistance at current levels. Consider waiting for a pullback before adding positions."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
