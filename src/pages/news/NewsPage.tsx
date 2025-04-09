
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Filter, Search, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock news categories for filtering
const categories = ["All", "Economy", "Markets", "Crypto", "Commodities", "Technology", "Stocks"];

// Mock news data structured with more detailed information
const newsItems = [
  {
    id: 1,
    title: "Federal Reserve holds interest rates steady, signals potential cuts later this year",
    summary: "The Federal Reserve maintained its benchmark interest rate at the current range of 5.25%-5.5% during its latest meeting, but signaled that rate cuts may be on the horizon as inflation continues to cool.",
    timestamp: "2 hours ago",
    category: "Economy",
    source: "Bloomberg",
    impact: { direction: "up", strength: 2, stocks: ["Banking", "Real Estate"] },
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  },
  {
    id: 2,
    title: "Tech stocks surge as inflation fears ease and AI adoption accelerates",
    summary: "Major technology stocks saw significant gains today as new data showed inflation cooling faster than expected, reducing pressure on the Fed to maintain high interest rates. AI-focused companies led the rally.",
    timestamp: "4 hours ago",
    category: "Markets",
    source: "CNBC",
    impact: { direction: "up", strength: 3, stocks: ["Technology", "Semiconductors"] },
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  },
  {
    id: 3,
    title: "Retail sales beat expectations in October, boosting consumer sector outlook",
    summary: "U.S. retail sales rose 0.8% in October, surpassing economists' expectations of a 0.3% increase, suggesting resilient consumer spending despite persistent inflation and higher interest rates.",
    timestamp: "6 hours ago",
    category: "Economy",
    source: "Reuters",
    impact: { direction: "up", strength: 2, stocks: ["Retail", "Consumer Goods"] },
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  },
  {
    id: 4,
    title: "Oil prices fall on higher-than-expected inventory build and reduced global demand outlook",
    summary: "Crude oil prices dropped over 3% following an EIA report showing U.S. crude inventories rose by 3.6 million barrels last week, substantially more than the 1.8 million barrel increase analysts expected.",
    timestamp: "8 hours ago",
    category: "Commodities",
    source: "Financial Times",
    impact: { direction: "down", strength: 2, stocks: ["Energy", "Oil & Gas"] },
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  },
  {
    id: 5,
    title: "Cryptocurrency market rebounds after weekend sell-off, Bitcoin approaches $40,000",
    summary: "The cryptocurrency market is staging a strong recovery after a significant sell-off over the weekend. Bitcoin has climbed back toward the $40,000 level, while Ethereum has gained more than 8% in the past 24 hours.",
    timestamp: "10 hours ago",
    category: "Crypto",
    source: "CoinDesk",
    impact: { direction: "up", strength: 3, stocks: ["Crypto", "Blockchain"] },
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  },
  {
    id: 6,
    title: "China announces new stimulus package to boost slowing economy",
    summary: "The Chinese government unveiled a comprehensive stimulus package aimed at revitalizing its slowing economy, including significant infrastructure investment and measures to boost consumer spending.",
    timestamp: "12 hours ago",
    category: "Economy",
    source: "South China Morning Post",
    impact: { direction: "up", strength: 2, stocks: ["Chinese ADRs", "Commodities"] },
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  },
];

export default function NewsPage() {
  const { user, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);

  // Fetch user credits when component mounts
  useEffect(() => {
    async function fetchUserCredits() {
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
    }
    
    fetchUserCredits();
  }, [user]);

  const handleGetAnalysis = async (articleId: number) => {
    if (!user) {
      toast.error("Please sign in to access AI analysis.");
      return;
    }
    
    if (userCredits === null) return;
    
    if (userCredits <= 0) {
      setShowSubscriptionPrompt(true);
      return;
    }
    
    try {
      // Deduct 1 credit
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ credits_remaining: userCredits - 1 })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setUserCredits(prev => prev !== null ? prev - 1 : null);
      
      // Get the article to analyze
      const article = newsItems.find(item => item.id === articleId);
      if (!article) return;
      
      // Show the article with analysis
      setSelectedArticle({
        ...article,
        analysis: `This news about ${article.title.toLowerCase()} is likely to have a ${
          article.impact.direction === 'up' ? 'positive' : 'negative'
        } impact on ${article.impact.stocks.join(', ')} stocks. The effect could be ${
          article.impact.strength === 3 ? 'significant' : article.impact.strength === 2 ? 'moderate' : 'mild'
        } and might persist for several trading sessions. Consider adjusting positions accordingly.`
      });
      
    } catch (error) {
      console.error("Error analyzing article:", error);
      toast.error("Failed to analyze article. Please try again.");
    }
  };
  
  // Filter news based on category and search term
  const filteredNews = newsItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              <h1 className="text-xl font-semibold">Market News</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/20 text-primary">
                {userCredits !== null ? `${userCredits} Credits Left` : 'Loading...'}
              </Badge>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="p-6">
          {/* Search and filter */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  placeholder="Search for news..." 
                  className="pl-10 bg-black/20 border-white/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={18} />
                <span>Filter</span>
              </Button>
            </div>
            
            {/* Categories */}
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <div className="flex gap-2 w-full">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`rounded-full ${selectedCategory === category ? "bg-primary" : ""}`}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Main content area - split view when article is selected */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* News list */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Latest Updates</h2>
              <div className="space-y-4">
                {filteredNews.map(item => (
                  <Card key={item.id} className="glass-card border-white/10 hover:border-primary/30 transition-all cursor-pointer" onClick={() => setSelectedArticle(item)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock size={12} className="mr-1" />
                          <span>{item.timestamp}</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-medium mb-2">{item.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.summary}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Source: {item.source}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGetAnalysis(item.id);
                          }}
                        >
                          Get AI Analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Article detail view */}
            {selectedArticle ? (
              <div className="lg:sticky lg:top-20 h-fit">
                <Card className="glass-card border-white/10">
                  <CardContent className="p-6">
                    <Badge variant="outline" className="mb-2">
                      {selectedArticle.category}
                    </Badge>
                    <h2 className="text-xl font-bold mb-2">{selectedArticle.title}</h2>
                    <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                      <span>Source: {selectedArticle.source}</span>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{selectedArticle.timestamp}</span>
                      </div>
                    </div>
                    
                    {selectedArticle.imageUrl && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img 
                          src={selectedArticle.imageUrl} 
                          alt={selectedArticle.title} 
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    
                    <p className="mb-6">{selectedArticle.summary}</p>
                    
                    {selectedArticle.analysis ? (
                      <Card className="bg-primary/10 border-primary/20 mb-4">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2 flex items-center">
                            <span className="text-primary mr-2">AI Analysis</span>
                            {selectedArticle.impact.direction === "up" ? (
                              <TrendingUp className="text-green-500" size={16} />
                            ) : (
                              <TrendingDown className="text-red-500" size={16} />
                            )}
                          </h4>
                          <p className="text-sm">{selectedArticle.analysis}</p>
                          <div className="mt-3 flex gap-2">
                            {selectedArticle.impact.stocks.map((stock: string, i: number) => (
                              <Badge key={i} variant="outline" className="bg-primary/5">
                                {stock}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => handleGetAnalysis(selectedArticle.id)}
                      >
                        Generate AI Analysis ({userCredits !== null ? userCredits : '?'} credits left)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="hidden lg:flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <p>Select an article to view details</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Subscription prompt */}
      {showSubscriptionPrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md glass-card border-primary/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-2 text-center">Upgrade to Premium</h2>
              <p className="text-center mb-6">You're out of AI analysis credits! Upgrade to continue getting AI-powered insights.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="border-white/10 p-4 hover:border-primary/30 transition-all cursor-pointer">
                  <h3 className="font-semibold">Monthly</h3>
                  <div className="text-xl font-bold my-2">₹99</div>
                  <p className="text-sm text-muted-foreground mb-2">10 AI analyses per day</p>
                  <Button size="sm" className="w-full">Select</Button>
                </Card>
                
                <Card className="border-primary/30 p-4 shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer">
                  <h3 className="font-semibold">Yearly</h3>
                  <div className="text-xl font-bold my-2">₹999</div>
                  <p className="text-sm text-muted-foreground mb-2">25 AI analyses per day</p>
                  <Button size="sm" className="w-full bg-primary">Best Value</Button>
                </Card>
              </div>
              
              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setShowSubscriptionPrompt(false)}>
                  Maybe Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
