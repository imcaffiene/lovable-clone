'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MessagesContainer } from './MessagesContainer';
import { Suspense, useState, useEffect } from 'react';
import { Fragment } from "@/generated/prisma";
import { ProjectHeader } from "./ProjectHeader";
import { FragmentWeb } from "./FragmentWeb";
import { Tabs } from "@radix-ui/react-tabs";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2Icon, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/utils/fileExplorer";
import { UserControls } from "@/components/utils/UserControls";
import { useAuth } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";


interface Props {
  projectId: string;
};

export const ProjectView = ({ projectId }: Props) => {

  const { has } = useAuth();
  const hasProAccess = has?.({ plan: "pro" });

  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tab, setTab] = useState<"code" | "preview">("preview");

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + 1: Switch to Live tab
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setTab('preview');
      }
      // Cmd/Ctrl + 2: Switch to Code tab
      if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        setTab('code');
      }
      // Escape: Focus message input (handled in MessageForm)
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className='h-screen'>

      {/* LEFT PANEL: Chat Interface */}
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className='flex flex-col min-h-0'
        >
          <ErrorBoundary
            fallback={
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Failed to load project header</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            }
          >
            <Suspense fallback={
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                  <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                </div>
              </div>
            }>
              <ProjectHeader projectId={projectId} />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary
            fallback={
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Failed to load messages</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            }
          >
            <Suspense fallback={
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="w-3/4 h-4 bg-muted rounded animate-pulse" />
                        <div className="w-1/2 h-4 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }>
              <MessagesContainer
                projectId={projectId}
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
              />
            </Suspense>
          </ErrorBoundary>
        </ResizablePanel>

        <ResizableHandle withHandle />


        {/* RIGHT PANEL: App Preview */}
        <ResizablePanel
          defaultSize={65}
          minSize={50}
        >
          <Tabs
            className="h-full flex flex-col"
            defaultValue="preview"
            value={tab}
            onValueChange={(value) => setTab(value as "code" | "preview")}
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2 bg-background">
              <TabsList className="h-8 p-0 border rounded-md bg-muted">
                <TabsTrigger
                  value="preview"
                  className="rounded-md text-foreground data-[state=active]:text-foreground data-[state=active]:bg-background"
                >
                  <EyeIcon /> <span>Live</span>
                </TabsTrigger>

                <TabsTrigger
                  value="code"
                  className="rounded-md text-foreground data-[state=active]:text-foreground data-[state=active]:bg-background"
                >
                  <Code2Icon /> <span>Code</span>
                </TabsTrigger>
              </TabsList>

              <div className="ml-auto flex items-center gap-x-2">

                {!hasProAccess && (
                  <Button asChild size={"sm"} variant={"default"}>
                    <Link href={"/pricing"}>
                      <CrownIcon /> Upgrade
                    </Link>
                  </Button>
                )}

                <UserControls />

              </div>
            </div>

            <TabsContent value="preview" className="flex-1 p-0 m-0 overflow-hidden">
              {!!activeFragment && <FragmentWeb data={activeFragment} />}
            </TabsContent>

            <TabsContent value="code" className="flex-1 p-0 m-0 overflow-hidden">
              {!!activeFragment?.files && (
                <FileExplorer files={activeFragment.files as { [path: string]: string; }} />
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div >
  );
};


















/**
 ProjectView (Parent)
├── MessagesContainer (Left Panel) - Chat interface
└── Preview Panel (Right Panel) - Generated app display

 */