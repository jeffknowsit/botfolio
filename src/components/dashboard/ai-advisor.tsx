
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SubscriptionModal } from "@/components/ui/subscription-modal";
import { toast } from "sonner";

export function AIAdvisor() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<null | {
    stock: string;
    direction: "up" | "down";
    confidence: number;
    advice: string;
  }>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);

  // Fetch user credits
  useEffect(() => {
    if (user) {
      setIsLoadingCredits(true);
      supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          setIsLoadingCredits(false);
          if (error) {
            console.error("Error fetching user credits:", error);
            return;
          }
          if (data) {
            setCredits(data.credits_remaining);
          }
        });
    }
  }, [user]);

  const handleGetPrediction = async () => {
    if (!user) {
      toast.error("Please sign in to get AI predictions");
      return;
    }
    
    // Check if user has credits
    if (credits !== null && credits <= 0) {
      setShowSubscriptionModal(true);
      return;
    }
    
    setIsPredicting(true);
    
    try {
      // Deduct credit from database
      const { data, error } = await supabase
        .from('user_credits')
        .update({ credits_remaining: (credits || 1) - 1 })
        .eq('user_id', user.id)
        .select('credits_remaining')
        .single();
      
      if (error) throw error;
      
      // Update credits in UI
      setCredits(data?.credits_remaining || 0);
      
      // Simulate AI prediction with timeout
      setTimeout(() => {
        setIsPredicting(false);
        setPrediction({
          stock: "NIFTY",
          direction: Math.random() > 0.5 ? "up" : "down",
          confidence: Math.floor(Math.random() * 30) + 70,
          advice: "Based on current patterns and market sentiment, there's a moderate buying opportunity over the next 48 hours.",
        });
        
        // If credits are now 0, we'll show a message
        if (data?.credits_remaining === 0) {
          toast.info("You've used all your AI prediction credits. Upgrade to Pro for more!");
        }
      }, 2000);
    } catch (error) {
      console.error("Error updating credits:", error);
      setIsPredicting(false);
      toast.error("Failed to get prediction");
    }
  };

  return (
    <>
      <Card className="glass-card border-white/10 neon-border">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI Advisor</h3>
            </div>
            <Badge variant="outline" className="text-xs">
              {isLoadingCredits ? "..." : credits !== null ? `${credits} Credits Left` : "Loading..."}
            </Badge>
          </div>

          {prediction ? (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{prediction.stock} Prediction</div>
                <div className="flex items-center">
                  <div 
                    className={`flex items-center ${
                      prediction.direction === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {prediction.direction === "up" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="ml-1 font-medium">
                      {prediction.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{prediction.advice}</div>
            </div>
          ) : (
            <div className="text-center py-4 mb-4">
              <p className="text-sm text-muted-foreground mb-4">
                Get AI predictions on market trends and stock movements
              </p>
            </div>
          )}

          <Button
            className="w-full bg-gradient-button hover:opacity-90"
            disabled={isPredicting || (credits !== null && credits <= 0)}
            onClick={handleGetPrediction}
          >
            {isPredicting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Analyzing...
              </>
            ) : credits !== null && credits <= 0 ? (
              "No credits left"
            ) : (
              "Get AI Prediction"
            )}
          </Button>

          {credits !== null && credits <= 2 && (
            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                className="text-xs text-primary p-0"
                onClick={() => setShowSubscriptionModal(true)}
              >
                Upgrade to Pro for Unlimited Predictions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Subscription modal */}
      <SubscriptionModal
        trigger={<></>} // Hidden trigger as we open it programmatically
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
      />
    </>
  );
}
