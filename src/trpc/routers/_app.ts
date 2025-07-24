import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { inngest } from "@/inngest/client";

export const appRouter = createTRPCRouter({
  invoke: baseProcedure
    .input(
      z.object({
        value: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Send the event to Inngest
      const eventId = await inngest.send({
        name: "test/hello.world",
        data: {
          value: input.value,
        },
      });

      // Return a meaningful response
      return {
        success: true,
        message: "Summarization job started successfully",
        eventId: eventId, // Inngest returns an event ID
        inputValue: input.value,
      };
    }),

  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});

export type AppRouter = typeof appRouter;
