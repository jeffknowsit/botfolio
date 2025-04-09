import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export default function Login() {
  const { signIn, signInWithGoogle, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    const { error, success } = await signIn(data.email, data.password);
    setIsLoading(false);
    
    if (success) {
      toast.success("Login successful");
      navigate("/dashboard");
    } else {
      toast.error(error?.message || "Failed to log in");
    }
  }
  
  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setIsGoogleLoading(false);
    
    if (error) {
      toast.error(error?.message || "Failed to sign in with Google");
    }
  }

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left side - Image */}
            <div className="hidden md:block h-full">
              <div 
                className="h-full rounded-xl overflow-hidden"
                style={{
                  backgroundImage: "url('/lovable-uploads/4be38a6f-4651-471c-b151-53ef486bfb68.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  minHeight: "600px"
                }}
              />
            </div>
            
            {/* Right side - Login Form */}
            <div className="glass-card p-8 lg:p-10">
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold mb-2">Welcome to BotFolio</h1>
                <p className="text-muted-foreground">Enter your credentials to sign in</p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full border-white/20 mb-6 flex items-center justify-center gap-2"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <FcGoogle className="h-5 w-5" />
                )}
                Sign in with Google
              </Button>
              
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-black/30 border-white/10"
                            placeholder="Your email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-black/30 border-white/10"
                            type="password"
                            placeholder="Your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="rememberMe"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label
                            htmlFor="rememberMe"
                            className="text-sm cursor-pointer"
                          >
                            Remember me
                          </label>
                        </div>
                      )}
                    />
                    
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-neon-blue hover:bg-neon-blue/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-center">
                <p className="text-sm">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
