
import { useState } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { X, Download, ChevronDown, ChevronUp, Filter, Sparkles } from "lucide-react";

// Generate historical data for the chart
const generateHistoricalData = (days: number) => {
  const data = [];
  let currentValue = 18500;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    const open = currentValue;
    const volatility = Math.random() * 100 + 50;
    const close = open + (Math.random() > 0.5 ? 1 : -1) * volatility * Math.random();
    const low = Math.min(open, close) - volatility * Math.random() * 0.5;
    const high = Math.max(open, close) + volatility * Math.random() * 0.5;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000 + 5000000),
    });
    
    currentValue = close;
  }
  
  return data;
};

interface DetailedChartProps {
  symbol: string;
  onClose: () => void;
}

export function DetailedChart({ symbol, onClose }: DetailedChartProps) {
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "5Y">("1M");
  const [chartType, setChartType] = useState<"area" | "line" | "candlestick">("area");
  const [showTools, setShowTools] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  
  // Generate data based on selected time range
  const getChartData = () => {
    switch(timeRange) {
      case "1D": return generateHistoricalData(1);
      case "1W": return generateHistoricalData(7);
      case "1M": return generateHistoricalData(30);
      case "3M": return generateHistoricalData(90);
      case "1Y": return generateHistoricalData(365);
      case "5Y": return generateHistoricalData(365 * 5);
      default: return generateHistoricalData(30);
    }
  };
  
  const chartData = getChartData();
  
  const handleGetPrediction = () => {
    setIsPredicting(true);
    setTimeout(() => {
      setIsPredicting(false);
      setPrediction({
        direction: "up",
        confidence: 82,
        target: symbol === "NIFTY 50" ? "19,200" : "76,500",
        timeframe: "1-2 weeks",
        advice: "Momentum indicators suggest a bullish trend. Consider long positions with tight stop-losses."
      });
    }, 2000);
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl h-[90vh] overflow-y-auto glass-card border-white/10">
        <CardContent className="p-0">
          {/* Header */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{symbol}</h2>
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X />
            </Button>
          </div>
          
          <div className="p-6">
            {/* Current Price Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <div className="text-sm text-muted-foreground">Current</div>
                <div className="text-2xl font-semibold">{symbol === "NIFTY 50" ? "18,532.75" : "61,259.32"}</div>
                <div className="text-sm text-green-500">+1.2%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Open</div>
                <div className="text-xl font-semibold">{symbol === "NIFTY 50" ? "18,450.25" : "61,019.12"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">High</div>
                <div className="text-xl font-semibold">{symbol === "NIFTY 50" ? "18,575.80" : "61,352.55"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Low</div>
                <div className="text-xl font-semibold">{symbol === "NIFTY 50" ? "18,392.30" : "60,925.40"}</div>
              </div>
            </div>
            
            {/* Chart Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex space-x-2">
                {["1D", "1W", "1M", "3M", "1Y", "5Y"].map((range) => (
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
                  variant={chartType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("line")}
                  className={chartType === "line" ? "bg-primary" : ""}
                >
                  Line
                </Button>
                <Button 
                  variant={chartType === "area" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("area")}
                  className={chartType === "area" ? "bg-primary" : ""}
                >
                  Area
                </Button>
                <Button 
                  variant={chartType === "candlestick" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("candlestick")}
                  className={chartType === "candlestick" ? "bg-primary" : ""}
                >
                  Candlestick
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTools(!showTools)}
                >
                  Tools {showTools ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {/* Tools Panel */}
            {showTools && (
              <div className="mb-6 p-4 bg-black/20 rounded-lg border border-white/5">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Moving Average
                  </Button>
                  <Button variant="outline" size="sm">RSI</Button>
                  <Button variant="outline" size="sm">MACD</Button>
                  <Button variant="outline" size="sm">Bollinger Bands</Button>
                  <Button variant="outline" size="sm">Volume</Button>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Add Indicator
                  </Button>
                </div>
              </div>
            )}
            
            {/* Main Chart */}
            <div className="h-[500px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "line" ? (
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" tick={{ fill: '#ccc' }} />
                    <YAxis tick={{ fill: '#ccc' }} domain={['dataMin - 200', 'dataMax + 200']} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    <Legend />
                    <Line type="monotone" dataKey="close" name={symbol} stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                ) : chartType === "area" ? (
                  <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" tick={{ fill: '#ccc' }} />
                    <YAxis tick={{ fill: '#ccc' }} domain={['dataMin - 200', 'dataMax + 200']} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    <Legend />
                    <Area type="monotone" dataKey="close" name={symbol} stroke="#8b5cf6" fillOpacity={1} fill="url(#colorClose)" />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" tick={{ fill: '#ccc' }} />
                    <YAxis tick={{ fill: '#ccc' }} domain={['dataMin - 200', 'dataMax + 200']} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    <Legend />
                    <Bar 
                      dataKey="volume" 
                      name="Volume" 
                      fill="#8b5cf6"
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.open > entry.close ? "#ef4444" : "#10b981"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            
            {/* AI Prediction Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="text-primary" size={18} />
                  AI Market Prediction
                </h3>
                {!prediction && (
                  <Button 
                    onClick={handleGetPrediction}
                    disabled={isPredicting}
                  >
                    {isPredicting ? "Analyzing market data..." : "Get AI Prediction"}
                  </Button>
                )}
              </div>
              
              {prediction && (
                <Card className="glass-card border-white/10 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center h-12 w-12 rounded-full ${
                          prediction.direction === "up" ? "bg-green-500/20" : "bg-red-500/20"
                        }`}>
                          <span className={`text-2xl ${
                            prediction.direction === "up" ? "text-green-500" : "text-red-500"
                          }`}>
                            {prediction.direction === "up" ? "↑" : "↓"}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Prediction</div>
                          <div className="text-xl font-semibold">
                            {prediction.direction === "up" ? "Bullish" : "Bearish"}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Confidence:</span> <span className="font-medium">{prediction.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Target Price</div>
                      <div className="text-xl font-semibold">{prediction.target}</div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Timeframe:</span> <span>{prediction.timeframe}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-sm text-muted-foreground mb-2">Analysis</div>
                    <p>{prediction.advice}</p>
                  </div>
                </Card>
              )}
            </div>
            
            {/* Export Button */}
            <div className="text-right">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Chart Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
