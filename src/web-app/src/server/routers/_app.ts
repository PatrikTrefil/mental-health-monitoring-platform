import { loadForm } from "@/client/formioClient";
import { UserRoleTitles } from "@/types/users";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const appRouter = createTRPCRouter({
    /**
     * Get list of all tasks
     */
    listTasks: protectedProcedure.query((opts) => {
        const userRoleTitles = opts.ctx.session.user.roleTitles;
        if (userRoleTitles.includes(UserRoleTitles.ZAMESTNANEC)) {
            return opts.ctx.prisma.task.findMany();
        } else if (userRoleTitles.includes(UserRoleTitles.KLIENT_PACIENT)) {
            return opts.ctx.prisma.task.findMany({
                where: {
                    forUserId: opts.ctx.session.user.data.id,
                },
            });
        } else throw new TRPCError({ code: "FORBIDDEN" });
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
                forUserId: z.string().nonempty(),
                description: z.string().optional(),
                formId: z.string().nonempty(),
            })
        )
        .mutation(async (opts) => {
            try {
                await loadForm(
                    opts.input.formId,
                    opts.ctx.session.user.formioToken
                );
            } catch (e) {
                console.error(e);
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Form with given formId not found",
                });
            }

            if (
                !opts.ctx.session.user.roleTitles.includes(
                    UserRoleTitles.ZAMESTNANEC
                )
            )
                throw new TRPCError({ code: "UNAUTHORIZED" });

            return opts.ctx.prisma.task.create({
                data: {
                    name: opts.input.name,
                    createdByEmployeeId: opts.ctx.session.user.data.id,
                    forUserId: opts.input.forUserId,
                    description: opts.input.description,
                    formId: opts.input.formId,
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
        .mutation(async (opts) => {
            await opts.ctx.prisma.task.delete({
                where: {
                    id: opts.input.id,
                },
            });
        }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
