"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import CaffeineLogo from "../logo/CaffeineLogo";
import { MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { memo, useCallback } from "react";

// Enhanced TypeScript types
interface ProjectWithActivity {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
}

interface ProjectCardProps {
  project: ProjectWithActivity;
  onDelete: (projectId: string) => void;
  isDeleting: boolean;
}

// Memoized Project Card Component
const ProjectCard = memo(({ project, onDelete, isDeleting }: ProjectCardProps) => {
  const handleDelete = useCallback(() => {
    onDelete(project.id);
  }, [project.id, onDelete]);

  return (
    <div className="relative group">
      <Button
        variant={"outline"}
        className="font-normal h-auto justify-start w-full text-start p-4"
        asChild
      >
        <Link href={`projects/${project.id}`}>
          <CaffeineLogo size="sm" variant="icon" />
          <div className="flex flex-col flex-1">
            <h3 className="truncate font-medium">
              {project.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(project.lastActivity), {
                addSuffix: true
              })}
            </p>
          </div>
        </Link>
      </Button>

      {/* Options Dropdown */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              aria-label={`Options for ${project.name}`}
            >
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}
            >
              <Trash2Icon className="h-4 w-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

export const ProjectList = () => {

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { data: projects } = useQuery(trpc.projects.getMany.queryOptions());

  const deleteProject = useMutation(trpc.projects.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(
        trpc.projects.getMany.queryOptions()
      );
      toast.success("Project deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete project");
    }
  }));

  const handleDelete = useCallback((projectId: string) => {
    deleteProject.mutate({ id: projectId });
  }, [deleteProject]);

  return (
    <div className="w-full bg-white dark:bg-sidebar rounded-xl p-8 border flex flex-col gap-y-6 sm:gap-y-4">
      <h2 className="text-2xl font-semibold">
        {user?.firstName} Consumed Caffiene
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {projects?.length === 0 && (
          <div className="col-span-full text-center">
            <p className="text-sm text-muted-foreground">
              No projects yet. Create one now!
            </p>
          </div>
        )}
        {projects?.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={handleDelete}
            isDeleting={deleteProject.isPending}
          />
        ))}
      </div>
    </div>
  );
};