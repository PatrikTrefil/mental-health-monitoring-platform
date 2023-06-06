import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const appRouter = createTRPCRouter({
    /**
     * Get list of all tasks
     */
    listTasks: protectedProcedure.query((opts) => {
        return opts.ctx.prisma.task.findMany();
    }),
    /**
     * Get task by id
     */
    getTask: protectedProcedure
        .input(
            z.object({
                id: z.number(),
            })
        )
        .query(async (opts) => {
            return opts.ctx.prisma.task.findUnique({
                where: {
                    id: opts.input.id,
                },
            });
        }),
    /**
     * Create new task
     */
    createTask: protectedProcedure
        .input(
            z.object({
                name: z.string(),
            })
        )
        .mutation(async (opts) => {
            return opts.ctx.prisma.task.create({
                data: {
                    name: opts.input.name,
                },
            });
        }),
    /**
     * Delete task by id
     */
    deleteTask: protectedProcedure
        .input(
            z.object({
                id: z.number(),
            })
        )
        .mutation((opts) => {
            return opts.ctx.prisma.task.delete({
                where: {
                    id: opts.input.id,
                },
            });
        }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
