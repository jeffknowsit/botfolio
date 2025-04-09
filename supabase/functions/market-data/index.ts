
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const apiKey = Deno.env.get("ALPHA_VANTAGE_API_KEY") || "demo";

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
    const { symbol, function: functionName = "GLOBAL_QUOTE" } = await req.json();
    
    if (!symbol) {
      throw new Error("Symbol parameter is required");
    }
    
    // Supported functions:
    // - GLOBAL_QUOTE: Get current price and change data
    // - TIME_SERIES_DAILY: Get daily time series
    // - TIME_SERIES_INTRADAY: Get intraday time series
    
    const apiUrl = `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}&apikey=${apiKey}`;
    
    console.log(`Fetching data for ${symbol} using ${functionName} function`);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data["Error Message"]) {
      throw new Error(data["Error Message"]);
    }
    
    if (data.Note && data.Note.includes("API call frequency")) {
      console.warn("API call frequency exceeded");
      // Return cached/mock data in this case to avoid blocking the user
      return new Response(JSON.stringify({
        symbol,
        price: Math.random() * 1000 + 100,
        change: (Math.random() * 8 - 4).toFixed(2),
        changePercent: (Math.random() * 5 - 2.5).toFixed(2) + "%",
        volume: Math.floor(Math.random() * 10000000),
        isMock: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Transform data based on the function type
    let transformedData;
    
    switch(functionName) {
      case "GLOBAL_QUOTE":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const quote: any = data["Global Quote"] || {};
        transformedData = {
          symbol: quote["01. symbol"],
          price: parseFloat(quote["05. price"]),
          change: parseFloat(quote["09. change"]),
          changePercent: quote["10. change percent"],
          volume: parseInt(quote["06. volume"]),
        };
        break;
        
      case "TIME_SERIES_DAILY":
        const timeSeries = data["Time Series (Daily)"];
        transformedData = Object.entries(timeSeries || {}).map(([date, values]) => ({
          date,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          open: parseFloat((values as any)["1. open"]),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          high: parseFloat((values as any)["2. high"]),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          low: parseFloat((values as any)["3. low"]),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          close: parseFloat((values as any)["4. close"]),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          volume: parseInt((values as any)["5. volume"]),
        }));
        break;
        
      default:
        transformedData = data;
    }

    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in market-data function:", error);
    
    return new Response(JSON.stringify({
      error: error.message,
      // Return some mock data in case of error
      mockData: {
        symbol: "MOCK",
        price: 123.45,
        change: 1.23,
        changePercent: "1.01%",
        volume: 1000000,
        isMock: true
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
