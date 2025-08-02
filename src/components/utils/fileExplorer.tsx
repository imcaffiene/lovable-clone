import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Hint } from "@/components/utils/hint";
import { Button } from "@/components/ui/button";
import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { CodeView } from "@/components/modules/code-view/CodeView";
import { convertFilesToTreeItem } from "@/lib/utils";
import { TreeView } from "@/components/modules/code-view/treeView";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type FileCollection = { [path: string]: string; }; //(map of paths to code/content)

// UTILITY FUNCTION
function getLanguageFromExtension(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLocaleLowerCase();
  return extension || "text";
  // Examples: "page.tsx" → "tsx", "utils.ts" → "ts", "README" → "text"
}

interface FileBreadcrumbsProps {
  filePath: string;
}

const FileBreadcrumbs = ({ filePath }: FileBreadcrumbsProps) => {
  const pathSegment = filePath.split("/");
  const maxSegmaent = 4;

  const renderBreadcrumbs = () => {
    if (pathSegment.length <= maxSegmaent) {
      //show all
      return pathSegment.map((segment, index) => {

        const isLast = index === pathSegment.length - 1;

        return (
          <Fragment key={index}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage className="font-medium">
                  {segment}
                </BreadcrumbPage>
              ) : (
                <span className="text-muted-foreground">
                  {segment}
                </span>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator />}
          </Fragment>
        );
      });
    } else {
      const firstSegment = pathSegment[0];
      const lastSegment = pathSegment[pathSegment.length - 1];

      return (
        <>
          <BreadcrumbItem>
            <span className="text-muted-foreground">
              {firstSegment}
            </span>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium" />
              {lastSegment}
            </BreadcrumbItem>
          </BreadcrumbItem>
        </>
      );
    }
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {renderBreadcrumbs()}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

interface FileExplorerProps {
  files: FileCollection;
}

export function FileExplorer({ files }: FileExplorerProps) {

  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });


  // Only recalculates when files change (performance optimization)
  const treeData = useMemo(() => {
    return convertFilesToTreeItem(files);
  }, [files]);


  // Prevents unnecessary re-renders of child components
  const handleFileSelect = useCallback((filePath: string) => {
    if (files[filePath]) {
      setSelectedFile(filePath);
    }
  }, [files]);

  const handleCopy = useCallback(() => {

    if (selectedFile) {
      navigator.clipboard.writeText(files[selectedFile]);

      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    }
  }, [selectedFile, files]);

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction='horizontal'>

        {/* LEFT: FILE LIST */}
        <ResizablePanel
          defaultSize={30}
          minSize={30}
          className='bg-sidebar'
        >
          <TreeView
            data={treeData}
            value={selectedFile}
            onSelect={handleFileSelect}
          />
        </ResizablePanel>

        <ResizableHandle className='hover:bg-primary transition-colors' />

        {/* RIGHT: FILE PREVIEW */}
        <ResizablePanel
          defaultSize={70}
          minSize={50}
        >
          {selectedFile && files[selectedFile] ? (
            <div className="h-full w-full flex flex-col">

              {/* HEADER BAR: File info and actions */}
              <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">

                <FileBreadcrumbs filePath={selectedFile} />

                <Hint text="Copy" side="bottom">
                  <Button
                    variant={"outline"}
                    size={"icon"}
                    className="ml-auto"
                    onClick={handleCopy}
                    disabled={copied}
                  >
                    {copied ? <CopyCheckIcon /> : <CopyIcon />}
                  </Button>
                </Hint>
              </div>


              {/* CODE PREVIEW AREA */}
              <div className="flex-1 overflow-auto">
                <CodeView
                  code={files[selectedFile]}
                  lang={getLanguageFromExtension(selectedFile)}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Select a file  to view it&apos;s contents
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}









/** 
 AI Generated Files → useMemo → TreeView → User Selection → CodeView
        ↓               ↓         ↓           ↓           ↓
   FileCollection → treeData → Hierarchical → Selected → Syntax
                                Display      File      Highlighted
                                                      Preview

 * */