import { messagesRouter } from "@/components/modules/messages/server/procedures";
import { createTRPCRouter } from "../init";
import { projectsRouter } from "@/components/modules/projects/server/procedures";
import { usageRouter } from "@/components/modules/usages/server/procedure";

export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  projects: projectsRouter,
  usage: usageRouter,
});

export type AppRouter = typeof appRouter;
