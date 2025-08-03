import prisma from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { generateSlug } from "random-word-slugs";
import { inngest } from "@/inngest/client";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/components/modules/usages/lib/usage";

export const projectsRouter = createTRPCRouter({
  // fetch a individual project by unique ID
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "ID is required" }),
      })
    )
    .query(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      return existingProject;
    }),

  // fetch the project list
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const project = await prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return project;
  }),

  // create a project
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Prompt is required" })
          .max(10000, { message: "Prompt is too long" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await consumeCredits();
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Something went wrong",
          });
        } else {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "You have reached your limit of free credits",
          });
        }
      }

      const createProjects = await prisma.project.create({
        data: {
          userId: ctx.auth.userId,
          name: generateSlug(3, {
            format: "kebab",
          }),

          //Create first message within this project
          messages: {
            create: {
              content: input.value, // User's initial request (e.g., "build a todo app")
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });
      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: createProjects.id, // Pass project ID to link AI response
        },
      });
      return createProjects;
    }),
});

/**
1. User creates project: "Build a todo app"
   ↓
2. Project created with random name: "swift-blue-penguin"
   ↓
3. First message saved: content="Build a todo app", role="USER"
   ↓
4. Inngest event sent with projectId
   ↓
5. AI agent processes request (your existing codeAgentFunction)
   ↓
6. AI response can be saved linked to the same project

 */
