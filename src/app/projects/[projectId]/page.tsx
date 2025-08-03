import { ProjectView } from '@/components/modules/projects/ui/ProjectPage';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectPage({ params }: Props) {

  const { projectId } = await params;

  const queryClient = getQueryClient();

  // PREFETCH DATA ON SERVER -> This fetches and caches messages before sending to client
  void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({
    projectId
  }));

  void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
    id: projectId
  }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<p>Error!</p>}>
        <Suspense fallback={<p>loading...</p>}>
          <ProjectView projectId={projectId} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
}

