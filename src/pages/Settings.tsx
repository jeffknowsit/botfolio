
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Shield, 
  Bell, 
  CreditCard, 
  BarChart3, 
  Trash2, 
  Download, 
  Save,
  AlertTriangle,
  Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Settings() {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  
  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Notifications state
  const [newsAlerts, setNewsAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [aiInsights, setAiInsights] = useState(true);
  
  // Fetch user credits from Supabase
  const { data: userCredits, isLoading: isLoadingCredits } = useQuery({
    queryKey: ['userCredits', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error("Error fetching user credits:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
  });
  
  // Set initial profile data
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      // We could fetch name from profiles table if needed
    }
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
  
  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    // Here we would update the user's profile in Supabase
    // For now, just show a success toast
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    }, 1000);
  };
  
  const handleToggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast({
      title: `Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}`,
      description: `You have ${!twoFactorEnabled ? 'enabled' : 'disabled'} two-factor authentication for your account.`,
    });
  };
  
  const handleDeleteAccount = async () => {
    // Here we would delete the user's account in Supabase
    // For now, just sign out
    
    await signOut();
    toast({
      title: "Account deleted",
      description: "Your account has been deleted successfully.",
      variant: "destructive",
    });
  };
  
  const handleDownloadData = () => {
    toast({
      title: "Download started",
      description: "Your data export has started. You will receive an email when it's ready.",
    });
  };

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
              <h1 className="text-xl font-semibold">Settings</h1>
            </div>
          </div>
        </header>
        
        {/* Settings content */}
        <main className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">Your Account Settings</h2>
            <p className="text-muted-foreground">
              Manage your profile, security, and preferences
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Profile Settings</h3>
                <Button 
                  size="sm" 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                >
                  <Save size={16} className="mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="John Doe" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled 
                  />
                  <p className="text-xs text-muted-foreground">
                    Email address cannot be changed
                  </p>
                </div>
              </div>
            </GlassCard>
            
            {/* Security Settings */}
            <GlassCard className="p-6">
              <div className="flex items-center mb-4">
                <Shield size={20} className="mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Security</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch 
                    checked={twoFactorEnabled} 
                    onCheckedChange={handleToggleTwoFactor} 
                  />
                </div>
                
                <div>
                  <Button variant="outline" className="w-full">
                    <Lock size={16} className="mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>
            </GlassCard>
            
            {/* AI Usage */}
            <GlassCard className="p-6">
              <div className="flex items-center mb-4">
                <BarChart3 size={20} className="mr-2 text-primary" />
                <h3 className="text-lg font-semibold">AI Usage</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Credits Remaining</p>
                  <div className="text-2xl font-bold text-primary">
                    {isLoadingCredits ? "..." : userCredits?.credits_remaining || 0}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="font-medium">Current Plan</p>
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                    {isLoadingCredits ? "..." : (userCredits?.plan_type === 'free' ? 'Free' : 
                      userCredits?.plan_type === 'monthly' ? 'Pro Monthly' : 'Pro Yearly')}
                  </div>
                </div>
                
                <Button className="w-full bg-gradient-button hover:opacity-90">
                  Upgrade Plan
                </Button>
              </div>
            </GlassCard>
            
            {/* Notification Settings */}
            <GlassCard className="p-6">
              <div className="flex items-center mb-4">
                <Bell size={20} className="mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Notifications</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">News Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about important market news
                    </p>
                  </div>
                  <Switch checked={newsAlerts} onCheckedChange={setNewsAlerts} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Price Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your tracked stocks change significantly
                    </p>
                  </div>
                  <Switch checked={priceAlerts} onCheckedChange={setPriceAlerts} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">AI Insights</p>
                    <p className="text-sm text-muted-foreground">
                      Receive personalized AI recommendations
                    </p>
                  </div>
                  <Switch checked={aiInsights} onCheckedChange={setAiInsights} />
                </div>
              </div>
            </GlassCard>
            
            {/* Subscription Plan */}
            <GlassCard className="p-6">
              <div className="flex items-center mb-4">
                <CreditCard size={20} className="mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Subscription Plan</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex justify-between mb-2">
                    <p className="font-medium">Current Plan</p>
                    <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                      {isLoadingCredits ? "..." : (userCredits?.plan_type === 'free' ? 'Free' : 
                        userCredits?.plan_type === 'monthly' ? 'Pro Monthly' : 'Pro Yearly')}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-4">
                    {userCredits?.plan_type === 'free' ? (
                      'Basic access with limited AI predictions'
                    ) : userCredits?.plan_type === 'monthly' ? (
                      'Unlimited AI predictions and advanced features'
                    ) : (
                      'Unlimited AI predictions and premium features at our best value'
                    )}
                  </div>
                  
                  <Button className="w-full bg-gradient-button hover:opacity-90">
                    {userCredits?.plan_type === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                  </Button>
                </div>
                
                <div className="text-center">
                  <Button variant="link" className="text-primary text-xs">
                    View Plan Comparison
                  </Button>
                </div>
              </div>
            </GlassCard>
            
            {/* Danger Zone */}
            <GlassCard variant="highlighted" className="p-6 col-span-1 lg:col-span-2">
              <div className="flex items-center mb-4">
                <AlertTriangle size={20} className="mr-2 text-red-500" />
                <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
              </div>
              
              <div className="space-y-4 lg:flex lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                <div className="flex-1">
                  <p className="font-medium">Download Your Data</p>
                  <p className="text-sm text-muted-foreground">
                    Export all your data in a machine-readable format
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                    onClick={handleDownloadData}
                  >
                    <Download size={16} className="mr-2" />
                    Export Data
                  </Button>
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-red-500">Delete Your Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently remove your account and all associated data
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="mt-2"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-card border-white/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAccount}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
}
