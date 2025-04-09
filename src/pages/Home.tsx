
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-dark overflow-hidden">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/81ad1a55-e046-4d74-a76e-cefef19ce0d7.png')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      
      <Navbar transparent />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[90vh] flex flex-col justify-center items-center px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-glow leading-tight">
              Master the Market with <span className="text-gradient">AI Insights</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Predict stock trends, track your portfolio, and stay ahead with real-time updates.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button 
                  size="lg" 
                  className="bg-neon-pink text-white hover:bg-neon-pink/80 rounded-full px-8 py-6 text-lg"
                >
                  Get Started
                </Button>
              </Link>
              <Link to="/pricing">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-gradient">Powerful Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="glass-card p-6 hover-glow">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Analytics</h3>
              <p className="text-muted-foreground">Get instant updates on market movements and stock performance.</p>
            </div>
            
            <div className="glass-card p-6 hover-glow">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold mb-2">AI Predictions</h3>
              <p className="text-muted-foreground">Advanced algorithms analyze trends and predict future movements.</p>
            </div>
            
            <div className="glass-card p-6 hover-glow">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Portfolio Tracking</h3>
              <p className="text-muted-foreground">Keep track of your investments and performance all in one place.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 container mx-auto px-4">
          <div className="glass-card max-w-4xl mx-auto p-10 bg-gradient-to-r from-[#160a24] to-[#0c0613]">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to transform your trading?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of traders using our AI insights platform.
              </p>
              <Link to="/signup">
                <Button className="bg-gradient-button rounded-full px-8 py-6 text-lg hover:opacity-90">
                  Start for Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold text-gradient">BotFolio</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 BotFolio. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
