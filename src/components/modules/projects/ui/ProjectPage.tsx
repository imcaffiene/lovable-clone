'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MessagesContainer } from './MessagesContainer';
import { Suspense, useState } from 'react';
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


interface Props {
  projectId: string;
};

export const ProjectView = ({ projectId }: Props) => {

  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tab, setTab] = useState<"code" | "preview">("preview");

  return (
    <div className='h-screen'>

      {/* LEFT PANEL: Chat Interface */}
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className='flex flex-col min-h-0'
        >
          <Suspense fallback={<p>loading...</p>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>

          <Suspense fallback={<p>loading...</p>}>
            <MessagesContainer
              projectId={projectId}
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
            />
          </Suspense>
        </ResizablePanel>

        <ResizableHandle withHandle />


        {/* RIGHT PANEL: App Preview */}
        <ResizablePanel
          defaultSize={65}
          minSize={50}
        >
          <Tabs
            className="h-full gap-y-0"
            defaultValue="preview"
            value={tab}
            onValueChange={(value) => setTab(value as "code" | "preview")}
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="h-8 p-0 border rounded-md">
                <TabsTrigger value="preview" className="rounded-md">
                  <EyeIcon /> <span>Live</span>
                </TabsTrigger>

                <TabsTrigger value="code" className="rounded-md">
                  <Code2Icon /> <span>Code</span>
                </TabsTrigger>
              </TabsList>

              <div className="ml-auto flex items-center gap-x-2">
                <Button asChild size={"sm"} variant={"default"}>
                  <Link href={"/pricing"}>
                    <CrownIcon /> Upgrade
                  </Link>
                </Button>

                <UserControls />

              </div>
            </div>

            <TabsContent value="preview" className="h-full w-full p-0">
              {!!activeFragment && <FragmentWeb data={activeFragment} />}
            </TabsContent>

            <TabsContent value="code" className="min-h-0">
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