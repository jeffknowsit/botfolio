
import { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { SubscriptionCard } from "@/components/pricing/subscription-card";
import { Switch } from "@/components/ui/switch";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly");
  };

  const plans = [
    {
      name: "Free",
      description: "Basic access for beginners",
      price: {
        monthly: 0,
        yearly: 0,
      },
      features: [
        { name: "Basic market data", available: true },
        { name: "5 AI predictions per month", available: true },
        { name: "Standard charts", available: true },
        { name: "Portfolio tracking (max 5 stocks)", available: true },
        { name: "Real-time market alerts", available: false },
        { name: "Advanced technical indicators", available: false },
        { name: "Priority support", available: false },
      ],
      ctaText: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      description: "Perfect for active traders",
      price: {
        monthly: 29,
        yearly: 19,
      },
      features: [
        { name: "Advanced market data", available: true },
        { name: "Unlimited AI predictions", available: true },
        { name: "Advanced charts with indicators", available: true },
        { name: "Portfolio tracking (unlimited)", available: true },
        { name: "Real-time market alerts", available: true },
        { name: "Advanced technical indicators", available: true },
        { name: "Priority support", available: false },
      ],
      ctaText: "Get Pro",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For professional traders and teams",
      price: {
        monthly: 99,
        yearly: 79,
      },
      features: [
        { name: "Premium market data", available: true },
        { name: "Unlimited AI predictions", available: true },
        { name: "Professional charts & tools", available: true },
        { name: "Portfolio tracking (unlimited)", available: true },
        { name: "Custom real-time alerts", available: true },
        { name: "Advanced technical indicators", available: true },
        { name: "Dedicated support", available: true },
      ],
      ctaText: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark overflow-hidden">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/27581ab2-747a-4611-98f1-f47e83483b11.png')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      
      <Navbar transparent />
      
      <main className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-glow leading-tight">
              Choose the Plan That's Right for You
            </h1>
            <p className="text-xl text-muted-foreground mb-10">
              Unlock powerful AI insights and real-time market data with our flexible plans
            </p>

            <div className="flex items-center justify-center space-x-4">
              <span 
                className={`text-sm ${billingCycle === "monthly" ? "text-primary" : "text-muted-foreground"}`}
              >
                Monthly
              </span>
              <Switch 
                checked={billingCycle === "yearly"} 
                onCheckedChange={toggleBillingCycle} 
              />
              <span 
                className={`text-sm flex items-center ${billingCycle === "yearly" ? "text-primary" : "text-muted-foreground"}`}
              >
                Yearly
                <span className="ml-2 bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                  Save up to 35%
                </span>
              </span>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <SubscriptionCard
                key={plan.name}
                name={plan.name}
                description={plan.description}
                price={{
                  monthly: plan.price.monthly,
                  yearly: plan.price.yearly,
                }}
                features={plan.features}
                ctaText={plan.ctaText}
                popular={plan.popular}
              />
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-medium mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">We accept all major credit cards, PayPal, and cryptocurrency payments including Bitcoin and Ethereum.</p>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-medium mb-2">Can I cancel or change my plan anytime?</h3>
                <p className="text-muted-foreground">Yes, you can upgrade, downgrade, or cancel your subscription at any time from your account dashboard.</p>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-medium mb-2">How accurate are the AI predictions?</h3>
                <p className="text-muted-foreground">Our AI model has demonstrated a 65-75% accuracy rate in historical testing, but market predictions always involve risk and past performance is not indicative of future results.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-6">Still have questions?</h2>
            <Button className="bg-white text-background hover:bg-white/90">
              Contact Support
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
