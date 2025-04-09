
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

// Mock news data
const newsItems = [
  {
    id: 1,
    title: "Federal Reserve holds interest rates steady",
    timestamp: "2 hours ago",
    category: "Economy",
  },
  {
    id: 2,
    title: "Tech stocks surge as inflation fears ease",
    timestamp: "4 hours ago",
    category: "Markets",
  },
  {
    id: 3,
    title: "Retail sales beat expectations in October",
    timestamp: "6 hours ago",
    category: "Economy",
  },
  {
    id: 4,
    title: "Oil prices fall on higher-than-expected inventory build",
    timestamp: "8 hours ago",
    category: "Commodities",
  },
  {
    id: 5,
    title: "Cryptocurrency market rebounds after weekend sell-off",
    timestamp: "10 hours ago",
    category: "Crypto",
  },
];

export function NewsFeed() {
  return (
    <Card className="glass-card h-full border-white/10">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold">Market News</h3>
        </div>
        <div className="space-y-6">
          {newsItems.map((item) => (
            <NewsItem
              key={item.id}
              title={item.title}
              timestamp={item.timestamp}
              category={item.category}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface NewsItemProps {
  title: string;
  timestamp: string;
  category: string;
}

function NewsItem({ title, timestamp, category }: NewsItemProps) {
  return (
    <div className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
      <div className="flex justify-between items-start mb-2">
        <Badge variant="outline" className="text-xs">
          {category}
        </Badge>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock size={12} className="mr-1" />
          <span>{timestamp}</span>
        </div>
      </div>
      <h4 className="text-sm font-medium hover:text-primary cursor-pointer transition-colors">
        {title}
      </h4>
    </div>
  );
}
