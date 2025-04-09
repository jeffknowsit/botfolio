
import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  BarChart,
  Bar,
} from "recharts";
import { Filter, Sparkles, RefreshCcw } from "lucide-react";
import { DetailedChart } from "@/components/market-stats/detailed-chart";

// Mock market data for NIFTY and SENSEX
const niftyData = [
  { date: '2023-01', value: 17500 },
  { date: '2023-02', value: 17300 },
  { date: '2023-03', value: 17100 },
  { date: '2023-04', value: 17600 },
  { date: '2023-05', value: 18100 },
  { date: '2023-06', value: 18400 },
  { date: '2023-07', value: 18200 },
  { date: '2023-08', value: 18500 },
  { date: '2023-09', value: 18700 },
  { date: '2023-10', value: 18600 },
  { date: '2023-11', value: 18900 },
  { date: '2023-12', value: 19000 },
];

const sensexData = [
  { date: '2023-01', value: 59000 },
  { date: '2023-02', value: 58500 },
  { date: '2023-03', value: 58000 },
  { date: '2023-04', value: 59500 },
  { date: '2023-05', value: 60500 },
  { date: '2023-06', value: 61000 },
  { date: '2023-07', value: 60500 },
  { date: '2023-08', value: 61500 },
  { date: '2023-09', value: 62000 },
  { date: '2023-10', value: 61800 },
  { date: '2023-11', value: 62500 },
  { date: '2023-12', value: 63000 },
];

// Mock sector performance data
const sectorPerformanceData = [
  { name: 'Technology', value: 8.2 },
  { name: 'Banking', value: 3.7 },
  { name: 'Energy', value: -2.1 },
  { name: 'Healthcare', value: 5.4 },
  { name: 'Consumer', value: 2.8 },
  { name: 'Industrials', value: 1.2 },
  { name: 'Materials', value: -1.5 },
  { name: 'Real Estate', value: -0.8 },
];

export default function AnalysisPage() {
  const { user, loading } = useAuth();
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [showDetailedChart, setShowDetailedChart] = useState<"NIFTY 50" | "SENSEX" | null>(null);
  
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
              {userCredits !== null && (
                <Badge variant="outline" className="bg-primary/20 text-primary">
                  {userCredits} Credits Left
                </Badge>
              )}
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <RefreshCcw size={14} />
                <span>Refresh</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter size={14} />
                <span>Filter</span>
              </Button>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="p-6">
          {/* Main Indices Analysis */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Market Indices</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* NIFTY 50 */}
              <Card className="glass-card border-white/10 hover:border-primary/30 transition-all cursor-pointer" onClick={() => setShowDetailedChart("NIFTY 50")}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">NIFTY 50</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">18,756.15</span>
                        <Badge className="bg-green-500/20 text-green-500">+1.2%</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={niftyData}>
                        <defs>
                          <linearGradient id="colorNifty" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#888" />
                        <YAxis stroke="#888" />
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1625",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#fff" }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#8b5cf6" 
                          fillOpacity={1}
                          fill="url(#colorNifty)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* SENSEX */}
              <Card className="glass-card border-white/10 hover:border-primary/30 transition-all cursor-pointer" onClick={() => setShowDetailedChart("SENSEX")}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">SENSEX</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">61,872.64</span>
                        <Badge className="bg-green-500/20 text-green-500">+0.8%</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sensexData}>
                        <defs>
                          <linearGradient id="colorSensex" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#888" />
                        <YAxis stroke="#888" />
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1625",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#fff" }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#06b6d4" 
                          fillOpacity={1}
                          fill="url(#colorSensex)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Sector Performance */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Sector Performance</h2>
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sectorPerformanceData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <XAxis type="number" stroke="#888" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#888"
                        width={70} 
                      />
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Change']}
                        contentStyle={{
                          backgroundColor: "#1a1625",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        name="% Change" 
                        fill={(entry) => entry.value >= 0 ? "#10b981" : "#ef4444"} 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* AI Market Insights */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-primary" size={24} />
              AI Market Insights
            </h2>
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Market Overview</h3>
                    <p className="mb-4 text-muted-foreground">
                      Markets are showing strength with both NIFTY 50 and SENSEX trading higher. 
                      The Technology sector continues to outperform with a significant 8.2% gain, 
                      while Energy struggles with a 2.1% decline. Foreign institutional investors 
                      showed net buying in the last session.
                    </p>
                    <h4 className="font-medium mb-2">Key Drivers</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Q4 earnings results exceeding expectations</li>
                      <li>Potential interest rate cuts on the horizon</li>
                      <li>Strong retail participation in the markets</li>
                      <li>Global market sentiment improvement</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Predictions</h3>
                    <Card className="bg-primary/10 border-primary/20 mb-4 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">NIFTY 50 Outlook</div>
                        <Badge variant="outline" className="bg-primary/20">85% Confidence</Badge>
                      </div>
                      <p className="text-sm mb-3">
                        Technical indicators suggest NIFTY 50 is likely to test the 19,000 level in 
                        the next 1-2 weeks, with strong support at 18,500. Volume patterns indicate 
                        continued buying interest.
                      </p>
                      <div className="text-xs text-muted-foreground">Based on latest market data</div>
                    </Card>
                    <Card className="bg-primary/10 border-primary/20 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">Sector Rotation</div>
                        <Badge variant="outline" className="bg-primary/20">78% Confidence</Badge>
                      </div>
                      <p className="text-sm mb-3">
                        The current market environment suggests a potential rotation from Technology 
                        to Banking and Healthcare sectors in the coming weeks as valuations adjust and 
                        earnings growth expectations shift.
                      </p>
                      <div className="text-xs text-muted-foreground">Based on sector analysis</div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      {/* Detailed chart modal */}
      {showDetailedChart && (
        <DetailedChart 
          symbol={showDetailedChart} 
          onClose={() => setShowDetailedChart(null)} 
        />
      )}
    </div>
  );
}
