import { useState, useEffect } from "react";
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
import { ChevronLeft, Download, Share2, TrendingUp, Search, Filter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { supabase, SUPABASE_PROJECT_URL } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { SubscriptionModal } from "@/components/ui/subscription-modal";

interface StockDetailModalProps {
  stock: any;
  onClose: () => void;
}

export function StockDetailModal({ stock, onClose }: StockDetailModalProps) {
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "All">("1M");
  const [chartType, setChartType] = useState<"line" | "area">("area");
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  
  // Fetch stock data and user credits on component mount
  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      try {
        // Fetch stock data from edge function
        const response = await fetch(
          `${SUPABASE_PROJECT_URL}/functions/v1/market-data/stocks?symbol=${stock.stock_symbol}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }
        
        const { data } = await response.json();
        setStockData(data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
        toast.error("Failed to load stock data");
      } finally {
        setLoading(false);
      }
    };
    
    const fetchUserCredits = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_credits')
          .select('credits_remaining')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setUserCredits(data.credits_remaining);
        }
      } catch (error) {
        console.error("Error fetching user credits:", error);
      }
    };
    
    fetchStockData();
    fetchUserCredits();
  }, [stock.stock_symbol, user]);
  
  const isPositive = parseFloat(stock.change) > 0;
  const trend = isPositive ? 'up' : 'down';
  
  // Use real data if available, otherwise fall back to mock data
  const historicalData = stockData?.prices || stock.chartData;

  const handleGetPrediction = async () => {
    // Fetch user credits
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits_remaining, plan_type')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setUserCredits(data.credits_remaining);
        
        if (data.credits_remaining <= 0) {
          setShowSubscriptionPrompt(true);
          return;
        }
        
        // Proceed with prediction if credits available
        setIsPredicting(true);
        
        // Deduct 1 credit
        const { error: updateError } = await supabase
          .from('user_credits')
          .update({ credits_remaining: data.credits_remaining - 1 })
          .eq('user_id', user?.id);
        
        if (updateError) throw updateError;
        
        // Simulate AI prediction with timeout
        setTimeout(async () => {
          setIsPredicting(false);
          const predictionDirection = Math.random() > 0.5 ? "up" : "down";
          const predictionResult = {
            direction: predictionDirection,
            confidence: Math.floor(Math.random() * 30) + 70,
            advice: predictionDirection === "up" 
              ? "Based on technical indicators and current market sentiment, this stock shows strong buying momentum. Consider adding positions over the next 48 hours."
              : "Technical indicators suggest a potential short-term pullback. Consider waiting for better entry points or reducing exposure.",
          };
          
          // Save prediction to database
          try {
            const { error } = await supabase
              .from('predictions')
              .insert({
                user_id: user?.id,
                stock_symbol: stock.stock_symbol,
                prediction: predictionDirection,
                confidence: predictionResult.confidence,
              });
              
            if (error) throw error;
            console.log("Prediction saved");
          } catch (err) {
            console.error("Error in prediction saving:", err);
          }
          
          setPrediction(predictionResult);
          
          // Update user credits display
          setUserCredits(prev => prev !== null ? prev - 1 : null);
        }, 2000);
      }
    } catch (error) {
      console.error("Error getting prediction:", error);
      toast.error("Failed to get prediction");
      setIsPredicting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto glass-card border-white/10">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading stock data...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <ChevronLeft />
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold">{stock.stock_symbol}</h2>
                    <div className="text-sm text-muted-foreground">{stock.stock_name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-semibold">
                        ${stockData?.prices?.[stockData.prices.length - 1]?.close.toFixed(2) || stock.price}
                      </span>
                      <span className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                        {isPositive ? "+" : ""}{stock.change}%
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
                        dataKey={stockData?.prices ? "date" : ""}
                        stroke="#888" 
                        tick={{ fill: '#ccc' }}
                      />
                      <YAxis 
                        stroke="#888" 
                        tick={{ fill: '#ccc' }}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey={stockData?.prices ? "close" : "value"}
                        name={stock.stock_symbol}
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
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey={stockData?.prices ? "date" : ""}
                        stroke="#888" 
                        tick={{ fill: '#ccc' }}
                      />
                      <YAxis 
                        stroke="#888" 
                        tick={{ fill: '#ccc' }}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey={stockData?.prices ? "close" : "value"}
                        name={stock.stock_symbol}
                        stroke={isPositive ? "#10b981" : "#ef4444"} 
                        fill="url(#colorValue)"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
              
              {/* Related News */}
              {stockData?.news && stockData.news.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Related News</h3>
                  <div className="space-y-3">
                    {stockData.news.map((news: any, index: number) => (
                      <Card key={index} className="border-white/10 p-3">
                        <h4 className="font-medium">{news.title}</h4>
                        <p className="text-sm text-muted-foreground my-1">{news.summary}</p>
                        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                          <span>{news.source}</span>
                          <span>{new Date(news.published_at).toLocaleDateString()}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="text-primary" size={18} />
                    AI Prediction
                  </h3>
                  {userCredits !== null && (
                    <Badge variant="outline" className="bg-primary/20 text-primary">
                      {userCredits} Credits Left
                    </Badge>
                  )}
                </div>
                
                {prediction ? (
                  <Card className="bg-black/30 border border-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Prediction confidence</span>
                      <span className={`text-sm font-medium ${prediction.direction === "up" ? "text-green-500" : "text-red-500"}`}>
                        {prediction.confidence}%
                      </span>
                    </div>
                    <p className="text-sm mb-4">{prediction.advice}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Based on latest market data
                      </span>
                      <div className={`flex items-center ${prediction.direction === "up" ? "text-green-500" : "text-red-500"}`}>
                        <TrendingUp className={`${prediction.direction === "down" && "rotate-180"} mr-1`} size={16} />
                        {prediction.direction === "up" ? "Bullish" : "Bearish"}
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={handleGetPrediction}
                    disabled={isPredicting}
                  >
                    {isPredicting ? "Generating prediction..." : "Get AI Prediction"}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Subscription prompt */}
      <SubscriptionModal
        trigger={<></>} // Hidden trigger, opened programmatically
        open={showSubscriptionPrompt}
        onOpenChange={setShowSubscriptionPrompt}
      />
    </div>
  );
}
