
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "highlighted";
  glowEffect?: boolean;
}

export function GlassCard({ 
  className, 
  variant = "default", 
  glowEffect = false,
  children, 
  ...props 
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl backdrop-blur-md border border-white/10", 
        {
          "bg-black/30": variant === "default",
          "bg-gradient-card": variant === "gradient",
          "bg-black/20 border-primary/30": variant === "highlighted",
          "hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-shadow duration-300": glowEffect
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
