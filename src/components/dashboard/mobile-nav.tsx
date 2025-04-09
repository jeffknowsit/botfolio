
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BarChart3,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
  FileText,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="lg:hidden">
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-black/90 to-black/80 backdrop-blur-xl">
        <div className="h-full flex flex-col">
          <div className="p-4">
            <Link to="/" className="flex items-center" onClick={() => setIsOpen(false)}>
              <span className="text-xl font-bold text-gradient">BotFolio</span>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto py-2 px-2">
            <nav className="space-y-1">
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
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
