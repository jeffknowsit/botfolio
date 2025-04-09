
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.2.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Get Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  const url = new URL(req.url)
  const path = url.pathname.split('/').pop()

  try {
    if (path === 'news') {
      // Fetch recent market news
      const { data, error } = await supabase
        .from('market_news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(10)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else if (path === 'stocks') {
      const symbol = url.searchParams.get('symbol')
      
      if (symbol) {
        // Fetch data for a specific stock
        const { data: stockData, error: stockError } = await supabase
          .from('indian_stocks')
          .select('*')
          .eq('symbol', symbol)
          .single()

        if (stockError) throw stockError

        // Create mock price data if no real data exists yet
        const mockPriceData = []
        const basePrice = 1000 + Math.random() * 2000
        const today = new Date()
        
        for (let i = 30; i >= 0; i--) {
          const date = new Date()
          date.setDate(today.getDate() - i)
          
          const dayFactor = Math.sin(i / 5) * 0.03
          const randomFactor = (Math.random() - 0.5) * 0.05
          const changePercent = dayFactor + randomFactor
          
          const open = i === 30 ? basePrice : mockPriceData[mockPriceData.length - 1].close
          const close = open * (1 + changePercent)
          const high = Math.max(open, close) * (1 + Math.random() * 0.02)
          const low = Math.min(open, close) * (1 - Math.random() * 0.02)
          const volume = Math.floor(Math.random() * 10000000) + 500000
          
          mockPriceData.push({
            date: date.toISOString().split('T')[0],
            open,
            high,
            low,
            close,
            volume,
            change: ((close - open) / open * 100).toFixed(2)
          })
        }

        // Get related news
        const { data: newsData } = await supabase
          .from('market_news')
          .select('*')
          .contains('related_symbols', [symbol])
          .order('published_at', { ascending: false })
          .limit(3)

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              stock: stockData,
              prices: mockPriceData,
              news: newsData || []
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } else {
        // Fetch all stocks
        const { data, error } = await supabase
          .from('indian_stocks')
          .select('*')
          .order('market_cap', { ascending: false })

        if (error) throw error

        // Add mock current prices
        const enhancedData = data.map(stock => {
          const basePrice = 1000 + Math.random() * 2000
          const changePercent = (Math.random() - 0.5) * 5
          
          return {
            ...stock,
            current_price: basePrice.toFixed(2),
            change: changePercent.toFixed(2)
          }
        })

        return new Response(
          JSON.stringify({ success: true, data: enhancedData }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid endpoint' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
