import { messagesRouter } from "@/components/modules/messages/server/procedures";
import { createTRPCRouter } from "../init";
import { projectsRouter } from "@/components/modules/projects/server/procedures";

export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;
