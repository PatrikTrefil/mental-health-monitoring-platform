import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const appRouter = createTRPCRouter({
    hello: publicProcedure
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
    helloUser: protectedProcedure.query((opts) => {
        return {
            greeting: `hello ${opts.ctx.session.user?.data.id}`,
        };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
