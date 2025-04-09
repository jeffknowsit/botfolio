
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionModalProps {
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  credits: number;
  features: PlanFeature[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    price: {
      monthly: 0,
      yearly: 0
    },
    credits: 5,
    features: [
      { name: "5 AI predictions per month", included: true },
      { name: "Basic portfolio tracking", included: true },
      { name: "Limited market news", included: true },
      { name: "Advanced analytics", included: false },
      { name: "Priority support", included: false },
    ]
  },
  {
    name: "Pro",
    price: {
      monthly: 99,
      yearly: 999
    },
    credits: 10,
    features: [
      { name: "10 AI predictions per day (Monthly)", included: true },
      { name: "25 AI predictions per day (Yearly)", included: true },
      { name: "Unlimited portfolio tracking", included: true },
      { name: "Full market news access", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Priority support", included: true },
    ],
    popular: true
  }
];

export function SubscriptionModal({ trigger, open, onOpenChange }: SubscriptionModalProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('pro');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user } = useAuth();
  
  const handleUpgrade = async () => {
    if (!user) {
      toast.error("Please sign in to upgrade your plan");
      return;
    }
    
    setIsProcessing(true);
    try {
      const planType = selectedPlan === 'free' ? 'free' : billing === 'monthly' ? 'pro_monthly' : 'pro_yearly';
      const credits = selectedPlan === 'free' ? 5 : billing === 'monthly' ? 10 : 25;
      
      // Update user credits and plan in Supabase
      const { error } = await supabase
        .from('user_credits')
        .update({
          credits_remaining: credits,
          plan_type: planType
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Show success message
      toast.success(`Successfully upgraded to ${selectedPlan === 'pro' ? 'Pro' : 'Free'} plan!`);
      
      // Close modal if onOpenChange is provided
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error upgrading plan:", error);
      toast.error("Failed to upgrade plan. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Choose Your Plan</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {/* Billing toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3 p-1 border border-white/10 rounded-full bg-black/20">
              <button
                className={`px-4 py-2 rounded-full transition-all ${
                  billing === 'monthly' ? 'bg-primary text-white' : 'hover:bg-white/5'
                }`}
                onClick={() => setBilling('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-full transition-all ${
                  billing === 'yearly' ? 'bg-primary text-white' : 'hover:bg-white/5'
                }`}
                onClick={() => setBilling('yearly')}
              >
                Yearly <span className="text-xs opacity-70">(Save 16%)</span>
              </button>
            </div>
          </div>
          
          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name.toLowerCase()}
                className={`border p-6 cursor-pointer transition-all ${
                  plan.popular ? 'border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-white/10'
                } ${
                  selectedPlan === plan.name.toLowerCase() ? 
                    'ring-2 ring-primary ring-offset-2 ring-offset-background' : 
                    'hover:border-white/20'
                }`}
                onClick={() => setSelectedPlan(plan.name.toLowerCase() as 'free' | 'pro')}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-xs rounded-bl-lg px-3 py-1 font-medium">
                    Popular
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-4">{plan.name}</h3>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold">
                    ₹{billing === 'monthly' ? plan.price.monthly : plan.price.yearly}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    /{billing === 'monthly' ? 'mo' : 'year'}
                  </span>
                </div>
                
                {billing === 'yearly' && plan.name === 'Pro' && (
                  <div className="bg-primary/10 text-primary text-sm p-2 rounded mb-4">
                    Save ₹{plan.price.monthly * 12 - plan.price.yearly} with annual billing
                  </div>
                )}
                
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center">
                      {feature.included ? (
                        <Check className="h-4 w-4 mr-3 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mr-3 text-muted-foreground" />
                      )}
                      <span className={`text-sm ${!feature.included && 'text-muted-foreground'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className={`w-full ${
                    plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-black/50 hover:bg-black/70'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => setSelectedPlan(plan.name.toLowerCase() as 'free' | 'pro')}
                >
                  {selectedPlan === plan.name.toLowerCase() ? 'Selected' : 'Select'}
                </Button>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end gap-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={isProcessing}
              onClick={handleUpgrade}
              className="bg-gradient-button hover:opacity-90"
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedPlan === 'free' ? 'Downgrade to Free' : `Upgrade to Pro (₹${billing === 'monthly' ? '99/mo' : '999/year'})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
