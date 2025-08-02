import { Button } from "@/components/ui/button";
import { Hint } from "@/components/utils/hint";
import { Fragment } from "@/generated/prisma";
import { ExternalLinkIcon, RefreshCcwDotIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  data: Fragment;
}

export const FragmentWeb = ({ data }: Props) => {

  const [fragmentKey, setFragmentKey] = useState(0);
  const [copied, setCopied] = useState(false);


  // Forces iframe to reload by changing its key prop
  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1);
    // Each increment creates a new iframe instance
    // Useful when the generated app has been updated
  };


  // Copy URL to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(data.sandboxUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => { setCopied(false); }, 2000);
      })
      .catch(() => {
        console.warn("Failed to copy URL to clipboard");
      });
  };

  return (
    <div className='flex flex-col w-full h-full overflow-hidden'>
      <div className='p-2 border-b bg-sidebar flex items-center gap-x-2'>

        {/* REFRESH BUTTON */}

        <Hint text="Refresh" side="bottom" align="start">
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={onRefresh}>
            <RefreshCcwDotIcon />
          </Button>
        </Hint>

        {/* URL DISPLAY AND COPY BUTTON */}

        <Hint text="Click to copy" side="bottom">
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={handleCopy}
            disabled={!data.sandboxUrl || copied}
            className='flex-1 justify-start text-start font-normal'
          >
            <span className=' truncate'>{data.sandboxUrl}</span>
          </Button>
        </Hint>

        {/* OPEN IN NEW TAB BUTTON */}

        <Hint text="Open in a new tab" side={"bottom"} align={"start"}>
          <Button
            size={"sm"}
            disabled={!data.sandboxUrl}
            variant={"outline"}
            onClick={() => {
              if (!data.sandboxUrl) return;
              window.open(data.sandboxUrl, '_blank');
            }}
          >
            <ExternalLinkIcon />
          </Button>
        </Hint>
      </div>

      <iframe
        key={fragmentKey}
        className="flex-1 w-full"
        sandbox='allow-scripts allow-same-origin allow-forms'
        loading='lazy'
        src={data.sandboxUrl}
      />
    </div>
  );
};


/**
allow-scripts: JavaScript execution (essential for React apps)
allow-same-origin: Access to same-origin resources (APIs, assets)
allow-forms: Form submission (for interactive components)
 */