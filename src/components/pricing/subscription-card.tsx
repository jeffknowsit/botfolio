
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  name: string;
  available: boolean;
}

interface SubscriptionCardProps {
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: Feature[];
  ctaText: string;
  popular?: boolean;
  className?: string;
}

export function SubscriptionCard({
  name,
  description,
  price,
  features,
  ctaText,
  popular = false,
  className,
}: SubscriptionCardProps) {
  return (
    <Card
      className={cn(
        "glass-card border-white/10 transition-all duration-300",
        popular ? "neon-border shadow-lg" : "",
        className
      )}
    >
      <CardHeader>
        {popular && (
          <div className="text-xs rounded-full px-3 py-1 bg-primary/20 text-primary inline-block mb-2 font-medium">
            Popular
          </div>
        )}
        <CardTitle className="text-xl">{name}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="text-3xl font-bold">${price.monthly}</div>
          <p className="text-sm text-muted-foreground">per month</p>
          <p className="text-xs text-muted-foreground">
            ${price.yearly * 12} billed yearly (save ${price.monthly * 12 - price.yearly * 12})
          </p>
        </div>
        <div className="space-y-2">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center">
              {feature.available ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <div className="h-4 w-4 mr-2 rounded-full border border-muted-foreground" />
              )}
              <span
                className={
                  feature.available
                    ? "text-sm"
                    : "text-sm text-muted-foreground"
                }
              >
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className={cn(
            "w-full", 
            popular 
              ? "bg-gradient-button hover:opacity-90" 
              : "bg-black/50 hover:bg-black/70"
          )}
        >
          {ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
}
