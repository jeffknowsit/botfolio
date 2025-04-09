
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronUp, ChevronDown } from "lucide-react";

export function AIAdvisor() {
  const [credits, setCredits] = useState(5);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<null | {
    stock: string;
    direction: "up" | "down";
    confidence: number;
    advice: string;
  }>(null);

  const handleGetPrediction = () => {
    if (credits <= 0) return;
    
    setIsPredicting(true);
    setCredits((prev) => prev - 1);
    
    // Simulate AI prediction with timeout
    setTimeout(() => {
      setIsPredicting(false);
      setPrediction({
        stock: "NIFTY",
        direction: Math.random() > 0.5 ? "up" : "down",
        confidence: Math.floor(Math.random() * 30) + 70,
        advice: "Based on current patterns and market sentiment, there's a moderate buying opportunity over the next 48 hours.",
      });
    }, 2000);
  };

  return (
    <Card className="glass-card border-white/10 neon-border">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Advisor</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            {credits} Credits Left
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
          disabled={isPredicting || credits <= 0}
          onClick={handleGetPrediction}
        >
          {isPredicting
            ? "Analyzing..."
            : credits <= 0
            ? "No credits left"
            : "Get AI Prediction"}
        </Button>

        {credits <= 2 && (
          <div className="mt-4 text-center">
            <Button variant="link" className="text-xs text-primary p-0">
              Upgrade to Pro for Unlimited Predictions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
