
import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Clock, 
  Loader2, 
  ChevronRight, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

// Mock news data
const mockNewsItems = [
  {
    id: 1,
    title: "Federal Reserve holds interest rates steady",
    summary: "The Fed maintains its key policy rate in the range of 5.25% to 5.5%, with Chair Jerome Powell signaling potential cuts later this year if inflation continues to moderate.",
    timestamp: new Date().setHours(new Date().getHours() - 2),
    category: "Economy",
    source: "Reuters",
    url: "#",
    imageUrl: "https://placehold.co/500x300/1a1625/cccccc"
  },
  {
    id: 2,
    title: "Tech stocks surge as inflation fears ease",
    summary: "Technology shares rallied as key inflation data came in softer than expected, potentially paving the way for less aggressive monetary policy from the Federal Reserve.",
    timestamp: new Date().setHours(new Date().getHours() - 4),
    category: "Markets",
    source: "Bloomberg",
    url: "#",
    imageUrl: "https://placehold.co/500x300/1a1625/cccccc"
  },
  {
    id: 3,
    title: "Retail sales beat expectations in October",
    summary: "Consumers showed resilience last month as retail sales increased 0.7%, exceeding analysts' expectations and suggesting continued economic strength despite higher interest rates.",
    timestamp: new Date().setHours(new Date().getHours() - 6),
    category: "Economy",
    source: "CNBC",
    url: "#",
    imageUrl: "https://placehold.co/500x300/1a1625/cccccc"
  },
  {
    id: 4,
    title: "Oil prices fall on higher-than-expected inventory build",
    summary: "Crude prices dropped after U.S. government data showed a larger-than-anticipated increase in oil stockpiles, raising concerns about demand in the world's largest economy.",
    timestamp: new Date().setHours(new Date().getHours() - 8),
    category: "Commodities",
    source: "Financial Times",
    url: "#",
    imageUrl: "https://placehold.co/500x300/1a1625/cccccc"
  },
  {
    id: 5,
    title: "Cryptocurrency market rebounds after weekend sell-off",
    summary: "Bitcoin and other digital assets are recovering after a sharp decline over the weekend, with analysts citing institutional buying as a key factor supporting prices.",
    timestamp: new Date().setHours(new Date().getHours() - 10),
    category: "Crypto",
    source: "CoinDesk",
    url: "#",
    imageUrl: "https://placehold.co/500x300/1a1625/cccccc"
  },
  {
    id: 6,
    title: "Major merger announced in pharmaceutical sector",
    summary: "Two leading pharmaceutical companies have agreed to a $65 billion merger, creating one of the industry's largest entities with a dominant position in cancer and rare disease treatments.",
    timestamp: new Date().setHours(new Date().getHours() - 12),
    category: "Business",
    source: "Wall Street Journal",
    url: "#",
    imageUrl: "https://placehold.co/500x300/1a1625/cccccc"
  }
];

export default function NewsPage() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newsItems, setNewsItems] = useState(mockNewsItems);
  const [filteredNews, setFilteredNews] = useState(mockNewsItems);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  
  // Extract unique categories
  useEffect(() => {
    const uniqueCategories = Array.from(new Set(newsItems.map(item => item.category)));
    setCategories(uniqueCategories as string[]);
  }, [newsItems]);
  
  // Filter news based on search query and category
  useEffect(() => {
    let filtered = newsItems;
    
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(lowerCaseQuery) || 
        item.summary.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredNews(filtered);
  }, [searchQuery, selectedCategory, newsItems]);
  
  // Fetch user credits
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

  const handleSearch = () => {
    setIsLoading(true);
    // Simulate search delay
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  const handleGetAiAnalysis = async () => {
    if (!selectedArticle || !user || userCredits === null || userCredits <= 0) {
      if (userCredits !== null && userCredits <= 0) {
        toast.error("You're out of AI credits. Please upgrade to continue.");
      }
      return;
    }
    
    setIsPredicting(true);
    
    try {
      // Deduct 1 credit
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ credits_remaining: userCredits - 1 })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      setUserCredits(prev => prev !== null ? prev - 1 : null);
      
      // Simulate AI analysis with timeout
      setTimeout(() => {
        setIsPredicting(false);
        const randomImpact = Math.random();
        const impactType = randomImpact > 0.7 ? "positive" : randomImpact < 0.3 ? "negative" : "neutral";
        
        setAiAnalysis({
          sentiment: impactType,
          impactScore: Math.floor(Math.random() * 10) + 1, // 1-10 scale
          marketImpact: {
            overall: impactType === "positive" ? "Positive" : impactType === "negative" ? "Negative" : "Neutral",
            sectors: [
              {
                name: "Technology",
                impact: impactType === "positive" ? "+0.5%" : impactType === "negative" ? "-0.5%" : "0.0%"
              },
              {
                name: "Finance",
                impact: impactType === "positive" ? "+0.7%" : impactType === "negative" ? "-0.3%" : "+0.1%"
              },
              {
                name: selectedArticle.category || "General",
                impact: impactType === "positive" ? "+1.2%" : impactType === "negative" ? "-0.9%" : "+0.2%"
              }
            ],
            stocks: [
              {
                symbol: "AAPL",
                impact: impactType === "positive" ? "+1.3%" : impactType === "negative" ? "-0.8%" : "+0.1%"
              },
              {
                symbol: "MSFT",
                impact: impactType === "positive" ? "+0.9%" : impactType === "negative" ? "-0.5%" : "+0.2%"
              },
              {
                symbol: "GOOGL",
                impact: impactType === "positive" ? "+1.1%" : impactType === "negative" ? "-0.7%" : "+0.0%"
              }
            ]
          },
          summary: impactType === "positive" 
            ? "This news is likely to have a positive impact on the market, particularly in the technology and finance sectors. Consider monitoring related stocks for potential opportunities." 
            : impactType === "negative"
              ? "This news may negatively affect market sentiment, especially in key sectors mentioned in the article. Exercise caution with related investments."
              : "This news is expected to have a minimal impact on the overall market, though some specific stocks might see minor movements."
        });
      }, 2000);
    } catch (error) {
      console.error("Error getting AI analysis:", error);
      setIsPredicting(false);
      toast.error("Failed to get AI analysis");
    }
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
      <DashboardSidebar />
      
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/40 backdrop-blur-lg border-b border-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MobileNav />
              <h1 className="text-xl font-semibold">Market News</h1>
            </div>
            <div className="flex items-center gap-2">
              {userCredits !== null && (
                <Badge variant="outline" className="bg-primary/20 text-primary">
                  {userCredits} Credits Left
                </Badge>
              )}
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {/* Search and filter bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Search news articles..." 
                className="pl-10 bg-black/20 border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="flex items-center gap-1"
              >
                <Filter size={16} />
                <span>Filter</span>
              </Button>
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>
          </div>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              size="sm" 
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            
            {categories.map((category) => (
              <Button 
                key={category}
                size="sm"
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          
          {/* Content grid with sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* News list */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin mb-4" />
                  <p className="text-muted-foreground">Loading news articles...</p>
                </div>
              ) : filteredNews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-primary/20 p-6 rounded-full mb-4">
                    <Search size={32} className="text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No news articles found</h2>
                  <p className="text-muted-foreground text-lg mb-6 max-w-md">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredNews.map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      isSelected={selectedArticle?.id === article.id}
                      onClick={() => setSelectedArticle(article)}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Article detail sidebar */}
            <div>
              <Card className="glass-card border-white/10 h-full">
                {selectedArticle ? (
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-2">{selectedArticle.title}</h2>
                    <div className="flex justify-between items-center mb-4">
                      <Badge>{selectedArticle.category}</Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock size={12} className="mr-1" />
                        <span>{new Date(selectedArticle.timestamp).toLocaleString()}</span>
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
                    
                    <p className="text-muted-foreground mb-6">{selectedArticle.summary}</p>
                    
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-sm">
                        Source: <span className="font-medium">{selectedArticle.source}</span>
                      </div>
                      <Button size="sm" variant="outline" className="text-primary">
                        Read Full Article
                        <ExternalLink className="ml-1" size={14} />
                      </Button>
                    </div>
                    
                    <div className="border-t border-white/10 pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Sparkles className="text-primary" size={18} />
                          AI Market Impact Analysis
                        </h3>
                      </div>
                      
                      {aiAnalysis ? (
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              aiAnalysis.sentiment === "positive" ? "bg-green-500/20" :
                              aiAnalysis.sentiment === "negative" ? "bg-red-500/20" :
                              "bg-blue-500/20"
                            }`}>
                              <span className={`text-xl ${
                                aiAnalysis.sentiment === "positive" ? "text-green-500" :
                                aiAnalysis.sentiment === "negative" ? "text-red-500" :
                                "text-blue-500"
                              }`}>
                                {aiAnalysis.sentiment === "positive" ? "↑" :
                                 aiAnalysis.sentiment === "negative" ? "↓" : "↔"}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Market Impact</div>
                              <div className="font-semibold">
                                {aiAnalysis.sentiment === "positive" ? "Positive" :
                                 aiAnalysis.sentiment === "negative" ? "Negative" : "Neutral"}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm text-muted-foreground mb-2">Sector Impact</h4>
                            <div className="space-y-2">
                              {aiAnalysis.marketImpact.sectors.map((sector: any, i: number) => (
                                <div key={i} className="flex justify-between items-center">
                                  <span>{sector.name}</span>
                                  <span className={`font-medium ${
                                    sector.impact.includes("+") ? "text-green-500" :
                                    sector.impact.includes("-") ? "text-red-500" : 
                                    "text-blue-500"
                                  }`}>{sector.impact}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm text-muted-foreground mb-2">Stocks to Watch</h4>
                            <div className="space-y-2">
                              {aiAnalysis.marketImpact.stocks.map((stock: any, i: number) => (
                                <div key={i} className="flex justify-between items-center">
                                  <span>{stock.symbol}</span>
                                  <span className={`font-medium ${
                                    stock.impact.includes("+") ? "text-green-500" :
                                    stock.impact.includes("-") ? "text-red-500" : 
                                    "text-blue-500"
                                  }`}>{stock.impact}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <p className="text-sm border-t border-white/5 pt-4">{aiAnalysis.summary}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Get AI-powered analysis of how this news might impact the market and specific stocks.
                          </p>
                          <Button 
                            onClick={handleGetAiAnalysis} 
                            className="w-full"
                            disabled={isPredicting || userCredits === null || userCredits <= 0}
                          >
                            {isPredicting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                              </>
                            ) : userCredits !== null && userCredits <= 0 ? (
                              "No credits left"
                            ) : (
                              "Get AI Analysis"
                            )}
                          </Button>
                          
                          {userCredits !== null && userCredits <= 2 && userCredits > 0 && (
                            <div className="text-center mt-2 text-xs text-amber-400">
                              You have limited credits remaining.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-primary/10 p-6 rounded-full mb-4">
                      <ChevronRight size={32} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Select an article</h3>
                    <p className="text-muted-foreground">
                      Choose a news article to view details and get AI market impact analysis
                    </p>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

interface NewsCardProps {
  article: any;
  isSelected: boolean;
  onClick: () => void;
}

function NewsCard({ article, isSelected, onClick }: NewsCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected 
          ? "border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
          : "border-white/10 hover:border-white/20"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {article.imageUrl && (
            <div className="sm:w-1/4">
              <div className="rounded-lg overflow-hidden h-40 sm:h-full">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          
          <div className={article.imageUrl ? "sm:w-3/4" : "w-full"}>
            <div className="flex justify-between items-start mb-2">
              <Badge variant="outline" className="text-xs">
                {article.category}
              </Badge>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock size={12} className="mr-1" />
                <span>{new Date(article.timestamp).toLocaleString()}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{article.summary}</p>
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Source: <span className="font-medium">{article.source}</span>
              </div>
              <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary">
                Read more
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
