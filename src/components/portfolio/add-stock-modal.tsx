
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase, SUPABASE_PROJECT_URL } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddStockModalProps {
  trigger: React.ReactNode;
  onStockAdded: () => void;
}

export function AddStockModal({ trigger, onStockAdded }: AddStockModalProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null);
  const [addingStock, setAddingStock] = useState(false);
  
  const { user } = useAuth();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // Fetch stocks from our edge function
      const response = await fetch(
        `${SUPABASE_PROJECT_URL}/functions/v1/market-data/stocks`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }
      
      const { data } = await response.json();
      
      // Filter by search query
      const filteredResults = data.filter(
        (stock: any) => 
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10); // Limit to 10 results
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error(error);
      toast.error("Failed to search stocks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // When modal opens, pre-load some stock data
    if (open && searchResults.length === 0 && !loading) {
      handleSearch();
    }
  }, [open]);

  const handleAddStock = async () => {
    if (!selectedStock || !user) return;
    
    setAddingStock(true);
    try {
      // First check if user has a portfolio
      const { data: portfolios } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id);
      
      let portfolioId: string;
      
      if (!portfolios || portfolios.length === 0) {
        // Create a portfolio if doesn't exist
        const { data: newPortfolio, error: portfolioError } = await supabase
          .from('portfolios')
          .insert({ user_id: user.id })
          .select('id')
          .single();
          
        if (portfolioError) throw portfolioError;
        portfolioId = newPortfolio.id;
      } else {
        portfolioId = portfolios[0].id;
      }
      
      // Add the stock to the portfolio
      const { error } = await supabase
        .from('portfolio_stocks')
        .insert({
          portfolio_id: portfolioId,
          stock_symbol: selectedStock.symbol,
          stock_name: selectedStock.name
        });
      
      if (error) throw error;
      
      toast.success(`${selectedStock.symbol} added to your portfolio!`);
      onStockAdded();
      setOpen(false);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedStock(null);
    } catch (error) {
      toast.error("Failed to add stock to portfolio");
      console.error(error);
    } finally {
      setAddingStock(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Stock to Portfolio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Search for stocks..." 
                className="pl-10 bg-black/20 border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {searchResults.map((stock) => (
              <Card 
                key={stock.symbol} 
                className={`p-3 cursor-pointer hover:bg-primary/10 transition-colors ${
                  selectedStock?.symbol === stock.symbol ? 'border-primary/40 bg-primary/10' : 'border-white/10'
                }`}
                onClick={() => setSelectedStock(stock)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-muted-foreground">{stock.name}</div>
                  </div>
                  {selectedStock?.symbol === stock.symbol && (
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Plus size={12} className="text-primary" />
                    </div>
                  )}
                </div>
              </Card>
            ))}
            
            {searchResults.length === 0 && searchQuery && !loading && (
              <div className="text-center p-4 text-muted-foreground">
                No stocks found. Try a different search.
              </div>
            )}
            
            {loading && (
              <div className="text-center p-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <div className="mt-2 text-muted-foreground">Searching stocks...</div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleAddStock} 
              disabled={!selectedStock || addingStock}
            >
              {addingStock ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add to Portfolio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
