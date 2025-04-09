
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Home,
  LogOut,
  Settings,
  User,
  FileText,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function DashboardSidebar() {
  const { pathname } = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "Market Analysis",
      icon: BarChart3,
      href: "/dashboard/analysis",
    },
    {
      title: "Portfolio",
      icon: PieChart,
      href: "/dashboard/portfolio",
    },
    {
      title: "News",
      icon: FileText,
      href: "/dashboard/news",
    },
    {
      title: "Profile",
      icon: User,
      href: "/dashboard/profile",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="hidden lg:flex h-screen w-64 flex-col bg-gradient-to-b from-black/50 to-black/30 border-r border-white/10 backdrop-blur-xl fixed left-0 top-0">
      <div className="p-4">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-gradient">BotFolio</span>
        </Link>
      </div>
      
      <div className="flex flex-col flex-1 px-3 py-4">
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                pathname === item.href
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.title}
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-primary/10 hover:text-foreground"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
