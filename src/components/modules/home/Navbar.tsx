"use client";

import { Button } from "@/components/ui/button";
import { UserControls } from "@/components/utils/UserControls";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import { SignedOut, SignInButton, SignUpButton, SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import CaffeineLogo from "../logo/CaffeineLogo";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";


export function Navbar() {

  const isScrolled = useScroll();
  const { theme, setTheme } = useTheme();

  return (
    <nav className=
      {cn(
        "p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent",
        isScrolled && "bg-background border-border"
      )}
    >
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
        <div className="flex items-center gap-12">
          <Link href={"/"} className="flex items-center gap-2">
            <CaffeineLogo size="sm" variant="icon" />
            <span className="font-semibold text-lg">Caffiene</span>
          </Link>

          <Link href={"/pricing"} className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
        </div>

        <SignedOut>
          <div className="flex gap-2">
            <SignUpButton>
              <Button variant={"outline"} size={"sm"}>
                Sign Up
              </Button>
            </SignUpButton>

            <SignInButton>
              <Button size={"sm"}>
                Sign In
              </Button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8"
            >
              <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <UserControls showName />
          </div>
        </SignedIn>
      </div>
    </nav>
  );
}

