
import { Navigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { MarketStats } from "@/components/dashboard/market-stats";
import { NewsFeed } from "@/components/dashboard/news-feed";
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview";
import { AIAdvisor } from "@/components/dashboard/ai-advisor";
import { useAuth } from "@/lib/auth";

export default function Dashboard() {
  const { user, loading } = useAuth();
  
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
          </div>
        </header>
        
        {/* Dashboard content */}
        <main className="p-6">
          {/* Welcome message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">Welcome back!</h2>
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
    </div>
  );
}
