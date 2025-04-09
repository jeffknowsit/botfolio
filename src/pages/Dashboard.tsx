
import { Navigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { MarketStats } from "@/components/market-stats/market-stats";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SubscriptionModal } from "@/components/ui/subscription-modal";
import { PortfolioOverview } from "@/components/portfolio/portfolio-overview";
import { NewsFeed } from "@/components/dashboard/news-feed";
import { AIAdvisor } from "@/components/dashboard/ai-advisor";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  // Fetch user credits
  useEffect(() => {
    async function fetchUserCredits() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_credits')
          .select('credits_remaining, plan_type')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setUserCredits(data.credits_remaining);
          
          // If user has 0 credits, show subscription modal
          if (data.credits_remaining === 0) {
            toast("You're out of AI prediction credits! Upgrade to Pro to get more.", {
              action: {
                label: "Upgrade",
                onClick: () => setShowSubscriptionModal(true)
              }
            });
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
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              {userCredits !== null && (
                <Badge variant="outline" className="bg-primary/20 text-primary">
                  {userCredits} Credits Left
                </Badge>
              )}
              <SubscriptionModal 
                trigger={
                  <Button size="sm" variant="outline">
                    Upgrade to Pro
                  </Button>
                }
              />
            </div>
          </div>
        </header>
        
        {/* Dashboard content */}
        <main className="p-6">
          {/* Welcome message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">Welcome back{user?.email ? `, ${user.email.split('@')[0]}!` : "!"}</h2>
            <p className="text-muted-foreground">
              Here's what's happening with the markets today.
            </p>
          </div>
          
          {/* Market statistics */}
          <div className="mb-8">
            <MarketStats />
          </div>
          
          {/* 3-column grid for dashboard widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* News feed */}
            <div className="md:col-span-1">
              <NewsFeed />
            </div>
            
            {/* Portfolio overview */}
            <div className="md:col-span-1">
              <PortfolioOverview />
            </div>
            
            {/* AI advisor */}
            <div className="md:col-span-1">
              <AIAdvisor />
            </div>
          </div>
        </main>
      </div>
      
      {/* Subscription modal */}
      <SubscriptionModal 
        open={showSubscriptionModal} 
        onOpenChange={setShowSubscriptionModal}
        trigger={<></>}
      />
    </div>
  );
}
