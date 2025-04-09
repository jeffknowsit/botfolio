
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Plus, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AddStockModal } from "./add-stock-modal";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { StockDetailModal } from "./stock-detail-modal";
import { Link } from "react-router-dom";

// Mock data for stock charts
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

export function PortfolioOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [portfolioStocks, setPortfolioStocks] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);

  // Fetch portfolio stocks from Supabase
  const fetchPortfolioStocks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Find user's portfolio
      const { data: portfolios } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id);
      
      if (!portfolios || portfolios.length === 0) {
        setLoading(false);
        setPortfolioStocks([]);
        return;
      }
      
      // Get stocks in this portfolio
      const { data: stocks, error } = await supabase
        .from('portfolio_stocks')
        .select('*')
        .eq('portfolio_id', portfolios[0].id);
      
      if (error) throw error;
      
      // Enhance stocks with mock data for UI
      const enhancedStocks = stocks.map(stock => ({
        ...stock,
        price: generateMockPrice(),
        change: generateMockChange(),
        chartData: generateChartData(Math.random() > 0.5 ? 'up' : 'down'),
        color: Math.random() > 0.5 ? "#34d399" : "#f43f5e",
      }));
      
      setPortfolioStocks(enhancedStocks);
    } catch (error) {
      console.error("Error fetching portfolio stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioStocks();
  }, [user]);

  return (
    <>
      <Card className="glass-card h-full border-white/10">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold">Your Portfolio</h3>
            <div className="flex gap-2">
              <AddStockModal 
                trigger={<Button size="sm" className="flex items-center gap-1">
                  <Plus size={16} />
                  <span>Add Stock</span>
                </Button>}
                onStockAdded={fetchPortfolioStocks}
              />
              <Link to="/dashboard/portfolio">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                  <ExternalLink size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-muted-foreground">Loading your portfolio...</p>
            </div>
          ) : portfolioStocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-primary/20 p-4 rounded-full mb-3">
                <Plus size={24} className="text-primary" />
              </div>
              <p className="mb-2">No stocks in your portfolio yet</p>
              <p className="text-muted-foreground text-sm mb-4">Add stocks to track their performance</p>
              <AddStockModal 
                trigger={<Button>Add Your First Stock</Button>}
                onStockAdded={fetchPortfolioStocks}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {portfolioStocks.map((stock) => (
                <StockCard
                  key={stock.id}
                  stock={stock}
                  onClick={() => setSelectedStock(stock)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Stock detail modal */}
      {selectedStock && (
        <StockDetailModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </>
  );
}

interface StockCardProps {
  stock: any;
  onClick: () => void;
}

function StockCard({ stock, onClick }: StockCardProps) {
  const isPositive = parseFloat(stock.change) > 0;

  return (
    <div 
      className="p-4 rounded-lg bg-black/20 hover:bg-black/30 transition cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold">{stock.stock_symbol}</div>
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
          {Math.abs(parseFloat(stock.change))}%
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-lg">${stock.price}</div>
        <div className="flex items-baseline h-8">
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
      <div className="text-xs text-muted-foreground mt-1">{stock.stock_name}</div>
    </div>
  );
}
