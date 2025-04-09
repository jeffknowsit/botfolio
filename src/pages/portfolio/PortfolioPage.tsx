
import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { supabase, SUPABASE_PROJECT_URL } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddStockModal } from "@/components/portfolio/add-stock-modal";
import { StockDetailModal } from "@/components/portfolio/stock-detail-modal";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubscriptionModal } from "@/components/ui/subscription-modal";
import { toast } from "sonner";

export default function PortfolioPage() {
  const { user, loading } = useAuth();
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [portfolioStocks, setPortfolioStocks] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  // Portfolio stats derived from stocks
  const totalValue = portfolioStocks.reduce(
    (sum, stock) => sum + parseFloat(stock.price), 
    0
  ).toFixed(2);
  
  const totalChange = portfolioStocks.length > 0 ? 
    (portfolioStocks.reduce(
      (sum, stock) => sum + parseFloat(stock.change), 
      0
    ) / portfolioStocks.length).toFixed(2) : 
    "0.00";
  
  const isPositiveTrend = parseFloat(totalChange) >= 0;

  // Fetch portfolio stocks from Supabase
  const fetchPortfolioStocks = async () => {
    if (!user) return;
    
    setLoadingStocks(true);
    try {
      // Find user's portfolio
      let { data: portfolios } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id);
      
      if (!portfolios || portfolios.length === 0) {
        // Create a new portfolio if one doesn't exist
        const { data: newPortfolio, error: createError } = await supabase
          .from('portfolios')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        
        if (createError) throw createError;
        portfolios = [newPortfolio];
      }
      
      // Get stocks in this portfolio
      const { data: stocks, error } = await supabase
        .from('portfolio_stocks')
        .select('*')
        .eq('portfolio_id', portfolios[0].id);
      
      if (error) throw error;
      
      if (stocks && stocks.length > 0) {
        try {
          // Fetch real-time stock data from edge function
          const response = await fetch(
            `${SUPABASE_PROJECT_URL}/functions/v1/market-data/stocks`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch stocks data');
          }
          
          const { data: stocksData } = await response.json();
          
          // Merge portfolio stocks with real-time data
          const enhancedStocks = stocks.map(stock => {
            const realTimeData = stocksData.find((s: any) => s.symbol === stock.stock_symbol);
            
            if (realTimeData) {
              return {
                ...stock,
                price: realTimeData.current_price,
                change: realTimeData.change,
                chartData: generateChartData(parseFloat(realTimeData.change) >= 0 ? 'up' : 'down'),
                color: parseFloat(realTimeData.change) >= 0 ? "#34d399" : "#f43f5e",
              };
            }
            
            // Fallback to mock data if real-time data not available
            return {
              ...stock,
              price: generateMockPrice(),
              change: generateMockChange(),
              chartData: generateChartData(Math.random() > 0.5 ? 'up' : 'down'),
              color: Math.random() > 0.5 ? "#34d399" : "#f43f5e",
            };
          });
          
          setPortfolioStocks(enhancedStocks);
        } catch (apiError) {
          console.error("Error fetching real-time stock data:", apiError);
          toast.error("Failed to fetch real-time stock data");
          
          // Fallback to mock data
          const enhancedStocks = stocks.map(stock => ({
            ...stock,
            price: generateMockPrice(),
            change: generateMockChange(),
            chartData: generateChartData(Math.random() > 0.5 ? 'up' : 'down'),
            color: Math.random() > 0.5 ? "#34d399" : "#f43f5e",
          }));
          
          setPortfolioStocks(enhancedStocks);
        }
      } else {
        setPortfolioStocks([]);
      }
    } catch (error) {
      console.error("Error fetching portfolio stocks:", error);
      toast.error("Failed to load your portfolio");
    } finally {
      setLoadingStocks(false);
    }
  };
  
  // Fetch user credits
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
        
        // Show subscription modal if credits are at 0
        if (data.credits_remaining === 0) {
          // Don't show modal immediately on page load
          // We'll just let the user see their portfolio first
          // setShowSubscriptionModal(true);
        }
      } else {
        // Create user credits if not exist
        const { error: insertError } = await supabase
          .from('user_credits')
          .insert({ user_id: user.id });
        
        if (insertError) throw insertError;
        setUserCredits(5); // Default credits
      }
    } catch (error) {
      console.error("Error fetching user credits:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPortfolioStocks();
      fetchUserCredits();
    }
  }, [user]);

  // Mock data for charts
  const generateChartData = (trend: 'up' | 'down') => {
    const randomStart = trend === 'up' ? 30 : 60;
    const direction = trend === 'up' ? 1 : -1;
    return Array(8).fill(0).map((_, i) => {
      const randomFactor = Math.random() * 10;
      return randomStart + (i * direction * 3) + randomFactor;
    });
  };

  // Generate mock stock price
  const generateMockPrice = () => {
    return (Math.random() * 200 + 50).toFixed(2);
  };

  // Generate mock change percentage
  const generateMockChange = () => {
    return (Math.random() * 5 - 2).toFixed(2);
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
              <h1 className="text-xl font-semibold">Portfolio</h1>
            </div>
            <div className="flex items-center gap-2">
              {userCredits !== null && (
                <Badge variant="outline" className="bg-primary/20 text-primary">
                  {userCredits} Credits Left
                </Badge>
              )}
              <AddStockModal 
                trigger={<Button size="sm" className="flex items-center gap-1">
                  <Plus size={16} />
                  <span>Add Stock</span>
                </Button>}
                onStockAdded={fetchPortfolioStocks}
              />
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="p-6">
          {/* Portfolio summary */}
          <Card className="glass-card border-white/10 mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h2 className="text-sm text-muted-foreground mb-1">Portfolio Value</h2>
                  <div className="text-2xl font-bold">${totalValue}</div>
                </div>
                <div>
                  <h2 className="text-sm text-muted-foreground mb-1">Average Change</h2>
                  <div className={`text-2xl font-bold flex items-center ${isPositiveTrend ? "text-green-500" : "text-red-500"}`}>
                    {isPositiveTrend && "+"}
                    {totalChange}%
                    {isPositiveTrend ? (
                      <TrendingUp size={20} className="ml-2" />
                    ) : (
                      <TrendingDown size={20} className="ml-2" />
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-sm text-muted-foreground mb-1">Total Stocks</h2>
                  <div className="text-2xl font-bold">{portfolioStocks.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Portfolio stocks */}
          {loadingStocks ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mb-4" />
              <p className="text-muted-foreground">Loading your portfolio...</p>
            </div>
          ) : portfolioStocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-primary/20 p-6 rounded-full mb-4">
                <Plus size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Your portfolio is empty</h2>
              <p className="text-muted-foreground text-lg mb-6 max-w-md">
                Add stocks to your portfolio to track their performance and get AI-powered insights
              </p>
              <AddStockModal 
                trigger={<Button size="lg">Add Your First Stock</Button>}
                onStockAdded={fetchPortfolioStocks}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioStocks.map((stock) => (
                <StockCard
                  key={stock.id}
                  stock={stock}
                  onClick={() => setSelectedStock(stock)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
      
      {/* Stock detail modal */}
      {selectedStock && (
        <StockDetailModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}
      
      {/* Subscription modal */}
      <SubscriptionModal
        trigger={<></>} // Hidden trigger as we open it programmatically
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
      />
    </div>
  );
}

interface StockCardProps {
  stock: any;
  onClick: () => void;
}

function StockCard({ stock, onClick }: StockCardProps) {
  const isPositive = parseFloat(stock.change) > 0;

  return (
    <Card 
      className="glass-card border-white/10 hover:border-primary/30 transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="font-semibold text-lg">{stock.stock_symbol}</div>
            <div className="text-xs text-muted-foreground">{stock.stock_name}</div>
          </div>
          <div
            className={cn(
              "flex items-center text-sm",
              isPositive ? "text-green-500" : "text-red-500"
            )}
          >
            {isPositive ? (
              <TrendingUp size={16} className="mr-1" />
            ) : (
              <TrendingDown size={16} className="mr-1" />
            )}
            {isPositive && "+"}
            {stock.change}%
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div className="text-xl">${stock.price}</div>
          <div className="flex items-baseline h-10">
            {stock.chartData.map((value: number, i: number) => (
              <div
                key={i}
                className="mx-px w-1 rounded-t"
                style={{
                  height: `${value}%`,
                  backgroundColor: stock.color,
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Added: {new Date(stock.added_at).toLocaleDateString()}
          </div>
          <Button variant="ghost" size="sm" className="text-primary text-xs">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
