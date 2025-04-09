
import { useState, useMemo } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
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
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Calendar,
  Clock,
  Download,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";

// Mock data for charts
const generateOHLCData = (days: number) => {
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
    
    currentValue = close; // Set next day's opening to today's close
  }
  
  return data;
};

// Generate data for sectoral performance
const generateSectoralData = () => {
  const sectors = [
    "IT",
    "Banking",
    "FMCG",
    "Pharma",
    "Auto",
    "Energy",
    "Metal",
    "Realty",
  ];
  
  return sectors.map(sector => ({
    name: sector,
    change: (Math.random() * 8 - 4).toFixed(2), // Between -4% and 4%
  }));
};

// Generate data for top gainers and losers
const generateGainersLosers = () => {
  const stocks = [
    { symbol: "TCS", name: "Tata Consultancy Services" },
    { symbol: "INFY", name: "Infosys Ltd." },
    { symbol: "HDFC", name: "HDFC Bank" },
    { symbol: "RELIANCE", name: "Reliance Industries" },
    { symbol: "SBIN", name: "State Bank of India" },
    { symbol: "ICICI", name: "ICICI Bank" },
    { symbol: "BHARTIARTL", name: "Bharti Airtel" },
    { symbol: "ITC", name: "ITC Ltd." },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever" },
    { symbol: "ASIANPAINT", name: "Asian Paints" },
  ];
  
  // Create gainers
  const gainers = [...stocks].slice(0, 5).map(stock => ({
    ...stock,
    change: (Math.random() * 5 + 1).toFixed(2), // 1% to 6%
    price: (Math.random() * 1000 + 500).toFixed(2),
  }));
  
  // Create losers
  const losers = [...stocks].slice(5).map(stock => ({
    ...stock,
    change: (-Math.random() * 5 - 1).toFixed(2), // -1% to -6%
    price: (Math.random() * 1000 + 500).toFixed(2),
  }));
  
  return { gainers, losers };
};

export default function AnalysisPage() {
  const { user, loading } = useAuth();
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "5Y">("1M");
  const [chartType, setChartType] = useState<"candlestick" | "area" | "line">("area");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  
  // Generate data based on selected time range
  const chartData = useMemo(() => {
    switch(timeRange) {
      case "1D": return generateOHLCData(1);
      case "1W": return generateOHLCData(7);
      case "1M": return generateOHLCData(30);
      case "3M": return generateOHLCData(90);
      case "1Y": return generateOHLCData(365);
      case "5Y": return generateOHLCData(365 * 5);
      default: return generateOHLCData(30);
    }
  }, [timeRange]);
  
  const sectoralData = useMemo(() => generateSectoralData(), []);
  const { gainers, losers } = useMemo(() => generateGainersLosers(), []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    // Simulate search delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  const handleGetPrediction = () => {
    setIsPredicting(true);
    // Simulate AI prediction delay
    setTimeout(() => {
      setIsPredicting(false);
      setPrediction({
        direction: "up", // or "down"
        confidence: 78,
        summary: "Based on technical indicators and market sentiment, NIFTY is likely to show a positive trend in the short term, with potential resistance at 19,200 level.",
        factors: [
          "Positive momentum in global markets",
          "Strong institutional buying",
          "Technical indicators showing bullish signals",
          "Improved sector rotation"
        ]
      });
    }, 2000);
  };

  // If not logged in and not loading, redirect to login
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }
  
  // Show loading state if still checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Dashboard sidebar for desktop */}
      <DashboardSidebar />
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/40 backdrop-blur-lg border-b border-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MobileNav />
              <h1 className="text-xl font-semibold">Market Analysis</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  placeholder="Search stocks or indices..." 
                  className="pl-10 bg-black/20 border-white/10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                size="sm" 
                onClick={handleSearch} 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="p-6">
          {/* Market Overview Card */}
          <Card className="glass-card border-white/10 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">NIFTY 50 Overview</h2>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                    <Calendar size={14} />
                    <span>{new Date().toLocaleDateString()}</span>
                    <Clock size={14} className="ml-2" />
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4 md:mt-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setChartType("line")}
                    className={chartType === "line" ? "border-primary text-primary" : ""}
                  >
                    Line
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setChartType("area")}
                    className={chartType === "area" ? "border-primary text-primary" : ""}
                  >
                    Area
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setChartType("candlestick")}
                    className={chartType === "candlestick" ? "border-primary text-primary" : ""}
                  >
                    Candlestick
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-6 mb-6">
                <div>
                  <div className="text-sm text-muted-foreground">Open</div>
                  <div className="text-xl font-semibold">18,450.25</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">High</div>
                  <div className="text-xl font-semibold">18,532.10</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Low</div>
                  <div className="text-xl font-semibold">18,392.30</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Close</div>
                  <div className="text-xl font-semibold">18,512.75</div>
                </div>
              </div>
              
              <div className="flex space-x-2 mb-6">
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
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" tick={{ fill: '#ccc' }} />
                      <YAxis tick={{ fill: '#ccc' }} domain={['dataMin - 100', 'dataMax + 100']} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                      <Legend />
                      <Line type="monotone" dataKey="close" name="NIFTY 50" stroke="#8b5cf6" strokeWidth={2} dot={false} />
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
                      <YAxis tick={{ fill: '#ccc' }} domain={['dataMin - 100', 'dataMax + 100']} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                      <Legend />
                      <Area type="monotone" dataKey="close" name="NIFTY 50" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorClose)" />
                    </AreaChart>
                  ) : (
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" tick={{ fill: '#ccc' }} />
                      <YAxis tick={{ fill: '#ccc' }} domain={['dataMin - 100', 'dataMax + 100']} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                      <Legend />
                      <Bar 
                        dataKey="volume" 
                        name="Volume" 
                        fill={(entry) => {
                          return entry.open > entry.close ? "#ef4444" : "#10b981";
                        }}
                        stroke="#333"
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Chart
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* AI Prediction Card */}
          <Card className="glass-card border-white/10 mb-6">
            <CardContent className="p-6">
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
                    {isPredicting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating prediction...
                      </>
                    ) : (
                      "Get Market Prediction"
                    )}
                  </Button>
                )}
              </div>
              
              {prediction && (
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <div className="flex gap-4 mb-4">
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
                      <div className="text-sm text-muted-foreground">Market Direction</div>
                      <div className="text-xl font-semibold">{prediction.direction === "up" ? "Bullish" : "Bearish"}</div>
                      <div className="text-sm mt-1">Confidence: <span className="font-medium">{prediction.confidence}%</span></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm text-muted-foreground mb-1">Summary</h4>
                    <p>{prediction.summary}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-1">Key Factors</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {prediction.factors.map((factor: string, i: number) => (
                        <li key={i} className="text-sm">{factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {!prediction && !isPredicting && (
                <div className="text-center text-muted-foreground py-8">
                  Get AI-powered market predictions and insights
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Secondary Analysis Tabs */}
          <Tabs defaultValue="sectoral">
            <TabsList className="mb-4">
              <TabsTrigger value="sectoral">Sectoral Performance</TabsTrigger>
              <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
              <TabsTrigger value="losers">Top Losers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sectoral">
              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sectoralData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis type="number" tick={{ fill: '#ccc' }} />
                        <YAxis dataKey="name" type="category" tick={{ fill: '#ccc' }} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                        <Legend />
                        <Bar 
                          dataKey="change" 
                          name="% Change" 
                          fill={(entry) => parseFloat(entry.change) >= 0 ? "#10b981" : "#ef4444"}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="gainers">
              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4">Symbol</th>
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-right py-3 px-4">Price</th>
                          <th className="text-right py-3 px-4">Change (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gainers.map((stock, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4 font-medium">{stock.symbol}</td>
                            <td className="py-3 px-4 text-muted-foreground">{stock.name}</td>
                            <td className="py-3 px-4 text-right">₹{stock.price}</td>
                            <td className="py-3 px-4 text-right text-green-500">+{stock.change}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="losers">
              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4">Symbol</th>
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-right py-3 px-4">Price</th>
                          <th className="text-right py-3 px-4">Change (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {losers.map((stock, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4 font-medium">{stock.symbol}</td>
                            <td className="py-3 px-4 text-muted-foreground">{stock.name}</td>
                            <td className="py-3 px-4 text-right">₹{stock.price}</td>
                            <td className="py-3 px-4 text-right text-red-500">{stock.change}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
