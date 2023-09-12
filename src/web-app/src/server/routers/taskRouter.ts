import { loadFormById } from "@/client/formManagementClient";
import { loadClientsAndPatients } from "@/client/userManagementClient";
import UserRoleTitles from "@/constants/userRoleTitles";
import { Prisma, type Deadline, type Task } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

type TaskWithDeadline = Task & { deadline: Deadline | null };

const taskRouter = createTRPCRouter({
    /**
     * Get list of all tasks. If user is {@link UserRoleTitles.ZADAVATEL_DOTAZNIKU}, return all tasks.
     * If user is {@link UserRoleTitles.KLIENT_PACIENT}, return only tasks for them.
     */
    listTasks: protectedProcedure
        .input(
            z.object({
                limit: z.number().nonnegative(),
                offset: z.number().nonnegative(),
            })
        )
        .query(
            async (
                opts
            ): Promise<{ data: TaskWithDeadline[]; count: number }> => {
                const userRoleTitles = opts.ctx.session.user.roleTitles;
                if (
                    userRoleTitles.includes(UserRoleTitles.ZADAVATEL_DOTAZNIKU)
                ) {
                    const [data, count] = await opts.ctx.prisma.$transaction([
                        opts.ctx.prisma.task.findMany({
                            include: { deadline: true },
                            skip: opts.input.offset,
                            take: opts.input.limit,
                        }),
                        opts.ctx.prisma.task.count(),
                    ]);
                    return { data, count };
                } else if (
                    userRoleTitles.includes(UserRoleTitles.KLIENT_PACIENT)
                ) {
                    const [data, count] = await opts.ctx.prisma.$transaction([
                        opts.ctx.prisma.task.findMany({
                            where: {
                                forUserId: opts.ctx.session.user.data.id,
                            },
                            include: {
                                deadline: true,
                            },
                            skip: opts.input.offset,
                            take: opts.input.limit,
                        }),
                        opts.ctx.prisma.task.count({
                            where: {
                                forUserId: opts.ctx.session.user.data.id,
                            },
                        }),
                    ]);
                    return { data, count };
                } else throw new TRPCError({ code: "FORBIDDEN" });
            }
        ),
    /**
     * Get task by id.
     * @returns The task with given id.
     * @throws {TRPCError}
     * FORBIDDEN if the user is not a {@link UserRoleTitles.ZADAVATEL_DOTAZNIKU} or {@link UserRoleTitles.KLIENT_PACIENT}.
     * @throws {TRPCError}
     * FORBIDDEN if the user is not an {@link UserRoleTitles.ZADAVATEL_DOTAZNIKU} and the task is not assigned to them.
     * @throws {TRPCError}
     * NOT_FOUND if the task does not exist.
     */
    getTask: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async (opts): Promise<TaskWithDeadline> => {
            const userRoleTitles = opts.ctx.session.user.roleTitles;

            if (
                !userRoleTitles.includes(UserRoleTitles.ZADAVATEL_DOTAZNIKU) &&
                !userRoleTitles.includes(UserRoleTitles.KLIENT_PACIENT)
            )
                throw new TRPCError({ code: "FORBIDDEN" });

            const result = await opts.ctx.prisma.task.findUnique({
                where: {
                    id: opts.input.id,
                },
                include: {
                    deadline: true,
                },
            });
            if (result === null) throw new TRPCError({ code: "NOT_FOUND" });

            if (
                result.forUserId !== opts.ctx.session.user.data.id &&
                !userRoleTitles.includes(UserRoleTitles.ZADAVATEL_DOTAZNIKU)
            ) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }
            return result;
        }),
    /**
     * Create new task.
     * @returns The created task.
     * @throws {TRPCError}
     * FORBIDDEN if the user is not an {@link UserRoleTitles.ZADAVATEL_DOTAZNIKU}.
     * @throws {TRPCError}
     * CONFLICT if the form with given formId does not exist.
     * @throws {TRPCError}
     * CONFLICT if the user with given forUserId does not exist.
     * @throws {TRPCError}
     * INTERNAL_SERVER_ERROR if the checking of form existence fails.
     * @throws {TRPCError}
     * INTERNAL_SERVER_ERROR if the creation of task fails.
     * @throws {TRPCError}
     * INTERNAL_SERVER_ERROR if the loading of users fails.
     */
    createTask: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                forUserId: z.string().nonempty(),
                description: z.string().optional(),
                formId: z.string().nonempty(),
                deadline: z
                    .object({
                        dueDateTime: z.date(),
                        canBeCompletedAfterDeadline: z.boolean(),
                    })
                    .optional(),
                start: z.date().optional(),
            })
        )
        .mutation(async (opts): Promise<TaskWithDeadline> => {
            if (
                !opts.ctx.session.user.roleTitles.includes(
                    UserRoleTitles.ZADAVATEL_DOTAZNIKU
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
                console.error(e);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Checking of form existence failed",
                });
            }

            if (loadedForm === null)
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Form with given formId does not exist",
                });

            const users = await loadClientsAndPatients(
                opts.ctx.session.user.formioToken
            );

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
                    deadline: { create: opts.input.deadline },
                    start: opts.input.start,
                },
                include: { deadline: true },
            });
        }),
    /**
     * Delete task by id.
     * @throws {TRPCError}
     * FORBIDDEN if the user is not an {@link UserRoleTitles.ZADAVATEL_DOTAZNIKU}.
     * @throws {TRPCError}
     * NOT_FOUND if the task with given id does not exist.
     */
    deleteTask: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .mutation(async (opts): Promise<void> => {
            if (
                !opts.ctx.session.user.roleTitles.includes(
                    UserRoleTitles.ZADAVATEL_DOTAZNIKU
                )
            )
                throw new TRPCError({ code: "FORBIDDEN" });

            try {
                // https://www.prisma.io/docs/concepts/components/prisma-client/crud#cascading-deletes-deleting-related-records
                await prisma.$transaction([
                    // deleteMany will not fail even if there is nothing to delete (i.e. the task does not have a deadline)
                    opts.ctx.prisma.deadline.deleteMany({
                        where: {
                            taskId: opts.input.id,
                        },
                    }),
                    opts.ctx.prisma.task.delete({
                        where: {
                            id: opts.input.id,
                        },
                    }),
                ]);
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

export default taskRouter;
