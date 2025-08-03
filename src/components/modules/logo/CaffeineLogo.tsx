import { cn } from "@/lib/utils";

interface CaffeineLogoProps {
  variant?: 'wordmark' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const CaffeineLogo = ({
  variant = 'wordmark',
  size = 'md',
  className
}: CaffeineLogoProps) => {

  const sizeClasses = {
    sm: variant === 'icon' ? 'w-8 h-8' : 'h-8',
    md: variant === 'icon' ? 'w-12 h-12' : 'h-12',
    lg: variant === 'icon' ? 'w-16 h-16' : 'h-16',
    xl: variant === 'icon' ? 'w-24 h-24' : 'h-24'
  };

  if (variant === 'text') {
    return (
      <div
        className={cn(
          "font-mono font-bold select-none",
          // Simple text colors with no background
          "text-gray-900 dark:text-gray-300",
          size === 'sm' && "text-xl",
          size === 'md' && "text-3xl",
          size === 'lg' && "text-4xl",
          size === 'xl' && "text-6xl",
          className
        )}
      >
        CAFFEINE
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl",
          // Removed background - now transparent
          sizeClasses[size],
          className
        )}
      >
        <span className={cn(
          "font-mono font-bold select-none",
          // Text colors remain for visibility
          "text-gray-900 dark:text-gray-300",
          size === 'sm' && "text-lg",
          size === 'md' && "text-2xl",
          size === 'lg' && "text-3xl",
          size === 'xl' && "text-4xl",
        )}>
          {">_"}
        </span>
      </div>
    );
  }

  // Wordmark variant
  return (
    <div
      className={cn(
        "flex items-center gap-3 select-none",
        sizeClasses[size],
        className
      )}
    >
      {/* Icon part - no background */}
      <div className={cn(
        "flex items-center justify-center rounded-xl",
        // Removed background and borders - completely transparent
        size === 'sm' && "w-8 h-8",
        size === 'md' && "w-10 h-10",
        size === 'lg' && "w-12 h-12",
        size === 'xl' && "w-16 h-16",
      )}>
        <span className={cn(
          "font-mono font-bold",
          // Simple text colors
          "text-gray-900 dark:text-gray-300",
          size === 'sm' && "text-sm",
          size === 'md' && "text-lg",
          size === 'lg' && "text-xl",
          size === 'xl' && "text-2xl",
        )}>
          {">_"}
        </span>
      </div>

      {/* Text part */}
      <span className={cn(
        "font-mono font-bold",
        // Simple text colors
        "text-gray-900 dark:text-gray-300",
        size === 'sm' && "text-lg",
        size === 'md' && "text-2xl",
        size === 'lg' && "text-3xl",
        size === 'xl' && "text-4xl",
      )}>
        CAFFEINE
      </span>
    </div>
  );
};

export default CaffeineLogo;
