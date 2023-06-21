import { loadFormById, loadUsers } from "@/client/formioClient";
import { UserRoleTitles } from "@/types/users";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const appRouter = createTRPCRouter({
    /**
     * Get list of all tasks. If user is employee, return all tasks.
     * If user is client, return only tasks for them.
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
     * Get task by id. If the task with given id does not exist, throw NOT_FOUND error.
     * If the task exists and it is assigned to the user that is requesting it, return it.
     * If the task exists and it is not assigned to the user that is requesting it and the user
     * is not an employee, throw FORBIDDEN error.
     */
    getTask: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async (opts) => {
            const userRoleTitles = opts.ctx.session.user.roleTitles;
            const result = await opts.ctx.prisma.task.findUnique({
                where: {
                    id: opts.input.id,
                },
            });
            if (result === null) throw new TRPCError({ code: "NOT_FOUND" });

            if (
                result.forUserId !== opts.ctx.session.user.data.id &&
                !userRoleTitles.includes(UserRoleTitles.ZAMESTNANEC)
            ) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }
            return result;
        }),
    /**
     * Create new task. If the user is not an employee, throw FORBIDDEN error.
     * If the form with given formId does not exist, throw CONFLICT error.
     * If the form with given formId exists and the user is an employee,
     * create new task and return it.
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
            if (
                !opts.ctx.session.user.roleTitles.includes(
                    UserRoleTitles.ZAMESTNANEC
                )
            )
                throw new TRPCError({ code: "FORBIDDEN" });

            let loadedForm:
                | Awaited<ReturnType<typeof loadFormById>>
                | undefined;
            try {
                loadedForm = await loadFormById(
                    opts.input.formId,
                    opts.ctx.session.user.formioToken
                );
            } catch (e) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                });
            }

            if (loadedForm === null)
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Form with given formId does not exist",
                });

            const users = await loadUsers(opts.ctx.session.user.formioToken);

            if (
                users.find((u) => u.data.id === opts.input.forUserId) ===
                undefined
            )
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "User with given forUserId does not exist",
                });

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
     * Delete task by id. If the user is not an employee, throw FORBIDDEN error.
     * If the task with given id does not exist, throw NOT_FOUND error. Otherwise
     * delete the task.
     */
    deleteTask: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .mutation(async (opts) => {
            if (
                !opts.ctx.session.user.roleTitles.includes(
                    UserRoleTitles.ZAMESTNANEC
                )
            )
                throw new TRPCError({ code: "FORBIDDEN" });

            try {
                await opts.ctx.prisma.task.delete({
                    where: {
                        id: opts.input.id,
                    },
                });
            } catch (e) {
                if (
                    e instanceof Prisma.PrismaClientKnownRequestError &&
                    e.code === "P2025" // Record to delete does not exist
                ) {
                    throw new TRPCError({ code: "NOT_FOUND" });
                }
                throw e;
            }
        }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
