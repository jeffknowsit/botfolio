
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the symbol from query parameters
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol');

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // For a real implementation you would use a market data API
    // This is a simplified mock implementation
    const mockData = getMockStockData(symbol);

    return new Response(
      JSON.stringify(mockData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in market-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Mock function to generate stock data based on symbol
function getMockStockData(symbol: string) {
  // Create a deterministic but random-looking price based on symbol
  const symbolHash = hashCode(symbol);
  const basePrice = 100 + (symbolHash % 900);
  
  // Generate price data for the last 30 days
  const data = [];
  let currentPrice = basePrice;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Create some variation day-to-day
    const dailyChange = ((symbolHash * i) % 10) / 100;
    currentPrice = currentPrice * (1 + (dailyChange - 0.05));
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(currentPrice.toFixed(2))
    });
  }
  
  // Calculate daily change
  const lastPrice = data[data.length - 1].price;
  const previousPrice = data[data.length - 2].price;
  const changeAmount = lastPrice - previousPrice;
  const changePercent = (changeAmount / previousPrice) * 100;
  
  return {
    symbol,
    price: lastPrice,
    change: changeAmount.toFixed(2),
    changePercent: changePercent.toFixed(2),
    high: (lastPrice * 1.02).toFixed(2),
    low: (lastPrice * 0.98).toFixed(2),
    volume: Math.floor(1000000 + (symbolHash % 9000000)),
    historicalData: data
  };
}

// Simple string hash function
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
