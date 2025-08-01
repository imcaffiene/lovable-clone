interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Light theme pattern
  const lightPatternStyle = {
    backgroundImage: `
      repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 40px),
      repeating-linear-gradient(45deg, rgba(0,100,200,0.08) 0, rgba(0,100,200,0.08) 1px, transparent 1px, transparent 20px),
      repeating-linear-gradient(-45deg, rgba(200,0,100,0.08) 0, rgba(200,0,100,0.08) 1px, transparent 1px, transparent 30px),
      radial-gradient(circle at 30% 70%, rgba(0,100,200,0.05) 0, transparent 50%)
    `,
    backgroundSize: "80px 80px, 40px 40px, 60px 60px, 100% 100%",
    backgroundPosition: "0 0, 0 0, 0 0, center",
    opacity: "0.5"
  };

  // Dark theme pattern - using your theme colors
  const darkPatternStyle = {
    backgroundImage: `
      repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 40px),
      repeating-linear-gradient(45deg, rgba(0,255,128,0.09) 0, rgba(0,255,128,0.09) 1px, transparent 1px, transparent 20px),
      repeating-linear-gradient(-45deg, rgba(255,0,128,0.10) 0, rgba(255,0,128,0.10) 1px, transparent 1px, transparent 30px),
      radial-gradient(circle at 60% 40%, rgba(0,255,128,0.05) 0, transparent 60%)
    `,
    backgroundSize: "80px 80px, 40px 40px, 60px 60px, 100% 100%",
    backgroundPosition: "0 0, 0 0, 0 0, center",
    opacity: "0.3"
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground relative">
      {/* Pattern Background - Separate layers for light/dark */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Light pattern */}
        <div
          className="absolute inset-0 opacity-50 dark:opacity-0 transition-opacity duration-300"
          style={lightPatternStyle}
        />
        {/* Dark pattern */}
        <div
          className="absolute inset-0 opacity-0 dark:opacity-30 transition-opacity duration-300"
          style={darkPatternStyle}
        />
      </div>

      {/* Content Container */}
      <div className="flex flex-col min-h-screen max-h-screen relative z-10">
        <div className="flex-1 flex flex-col px-4 pb-4">
          {children}
        </div>
      </div>
    </main>
  );
};

export default Layout;