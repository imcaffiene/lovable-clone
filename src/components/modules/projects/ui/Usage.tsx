import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface UsageProps {
  points: number;
  msBeforeNext: number;
}

export const Usage = ({ points, msBeforeNext }: UsageProps) => {

  const { has } = useAuth();
  const hasProAccess = has?.({ plan: "pro" });

  const resetTime = useMemo(() => {
    try {
      return formatDuration(
        intervalToDuration({
          start: new Date(),
          end: new Date(Date.now() + msBeforeNext)
        }),
        { format: ["months", "days", "hours"] }
      );
    } catch (e) {
      console.error("Error formatting duration", e);
      return "Error";
    }
  }, [msBeforeNext]);

  return (
    <div className="rounded-t-xl bg-sidebar dark:bg-sidebar border border-b-0 p-3">
      <div className="flex items-center gap-x-2">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            <span className="font-semibold text-primary">{points}</span> {hasProAccess ? "" : "free"} credits remaining
          </p>

          <p className="text-xs text-foreground/80 mt-0.5">
            Reset in <span className="font-medium">{resetTime}</span>
          </p>
        </div>

        {!hasProAccess && (
          <Button
            asChild
            size={"sm"}
            variant="outline"
            className="ml-auto"
          >
            <Link href={"/pricing"}>
              <CrownIcon /> Upgrade
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};