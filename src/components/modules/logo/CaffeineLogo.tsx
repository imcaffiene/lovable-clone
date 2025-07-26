import { cn } from "@/lib/utils";
import { useState } from "react";

interface CaffeineLogoProps {
  variant?: 'wordmark' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const CaffeineLogo = ({
  variant = 'wordmark',
  size = 'md',
  animated = true,
  className
}: CaffeineLogoProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: variant === 'icon' ? 'w-8 h-8' : 'h-8',
    md: variant === 'icon' ? 'w-12 h-12' : 'h-12',
    lg: variant === 'icon' ? 'w-16 h-16' : 'h-16',
    xl: variant === 'icon' ? 'w-24 h-24' : 'h-24'
  };

  const baseAnimations = animated ? 'transition-all duration-500 ease-out' : '';
  const hoverAnimations = animated ? 'hover:scale-105 hover:drop-shadow-lg' : '';

  if (variant === 'text') {
    return (
      <div
        className={cn(
          "font-mono font-bold bg-gradient-caffeine bg-clip-text text-transparent select-none cursor-pointer",
          size === 'sm' && "text-xl",
          size === 'md' && "text-3xl",
          size === 'lg' && "text-4xl",
          size === 'xl' && "text-6xl",
          baseAnimations,
          animated && "animate-gradient-shift hover:animate-glow-pulse",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundSize: '200% 200%',
          backgroundImage: 'var(--gradient-caffeine)'
        }}
      >
        CAFFEINE
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-caffeine cursor-pointer group",
          sizeClasses[size],
          baseAnimations,
          hoverAnimations,
          animated && "animate-scale-in",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className={cn(
          "font-mono font-bold text-primary-foreground select-none transition-transform duration-300",
          size === 'sm' && "text-lg",
          size === 'md' && "text-2xl",
          size === 'lg' && "text-3xl",
          size === 'xl' && "text-4xl",
          animated && isHovered && "animate-pulse"
        )}>
          {">_"}
        </span>
        {animated && (
          <div className="absolute inset-0 rounded-xl bg-gradient-caffeine opacity-0 group-hover:opacity-30 transition-opacity duration-300 animate-glow-pulse" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 select-none cursor-pointer group",
        sizeClasses[size],
        animated && "animate-fade-in",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "relative flex items-center justify-center rounded-xl bg-gradient-caffeine",
        size === 'sm' && "w-8 h-8",
        size === 'md' && "w-10 h-10",
        size === 'lg' && "w-12 h-12",
        size === 'xl' && "w-16 h-16",
        baseAnimations,
        hoverAnimations
      )}>
        <span className={cn(
          "font-mono font-bold text-primary-foreground transition-transform duration-300",
          size === 'sm' && "text-sm",
          size === 'md' && "text-lg",
          size === 'lg' && "text-xl",
          size === 'xl' && "text-2xl",
          animated && isHovered && "animate-pulse"
        )}>
          {">_"}
        </span>
        {animated && (
          <div className="absolute inset-0 rounded-xl bg-gradient-caffeine opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
        )}
      </div>
      <span className={cn(
        "font-mono font-bold bg-gradient-caffeine bg-clip-text text-transparent transition-all duration-300",
        size === 'sm' && "text-lg",
        size === 'md' && "text-2xl",
        size === 'lg' && "text-3xl",
        size === 'xl' && "text-4xl",
        animated && "animate-gradient-shift hover:scale-105",
      )}
        style={{
          backgroundSize: '200% 200%',
          backgroundImage: 'var(--gradient-caffeine)'
        }}>
        CAFFEINE
      </span>
    </div>
  );
};

export default CaffeineLogo;