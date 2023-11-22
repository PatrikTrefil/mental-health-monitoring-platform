import { loadFormById } from "@/client/formManagementClient";
import { loadClientsAndPatients } from "@/client/userManagementClient";
import UserRoleTitles from "@/constants/userRoleTitles";
import { Prisma, type Deadline, type Task } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export type TaskWithDeadline = Task & { deadline: Deadline | null };

/**
 * Convert object values to zod enum.
 * @param obj - Object to extract values from.
 * @throws {Error} If the object is empty.
 */
function ObjectValuesEnum<V extends string>(obj: Record<any, V>) {
    const values = Object.values(obj);
    if (values[0] === undefined)
        throw new Error("ObjectValuesEnum: empty enum");
    return z.enum([values[0], ...values]);
}

const deadlinePrefix = ("deadline" satisfies keyof TaskWithDeadline) + ".";
const taskDeadlineFieldOptions = ObjectValuesEnum(
    Prisma.DeadlineScalarFieldEnum
).options.map((v) => `${deadlinePrefix}${v}`);

if (taskDeadlineFieldOptions[0] === undefined)
    throw new Error("deadline field options empty");

/**
 * Schema for validating an accessor to a (possibly nested) property of the task object.
 * @example valid value "name"
 * @example valid value "deadline.dueDateTime"
 */
const taskFieldSchema = ObjectValuesEnum(Prisma.TaskScalarFieldEnum).or(
    z.enum([taskDeadlineFieldOptions[0], ...taskDeadlineFieldOptions])
);

const taskRouter = createTRPCRouter({
    /**
     * Get list of all tasks. If user is {@link UserRoleTitles.ZADAVATEL_DOTAZNIKU}, return all tasks.
     * If user is {@link UserRoleTitles.KLIENT_PACIENT}, return only tasks for them.
     */
    listTasks: protectedProcedure
        .input(
            z.object({
                pagination: z.object({
                    /**
                     * Maximum number of tasks to return.
                     */
                    limit: z.number().nonnegative(),
                    /**
                     * Offset of the first task to return. (also known as skip).
                     */
                    offset: z.number().nonnegative(),
                    /**
                     * Sort order of the results.
                     */
                }),
                sort: z
                    .object({
                        /**
                         * Field to sort by. If the field is nested withing the task object, use dot notation.
                         * @example "name"
                         * @example "deadline.dueDateTime"
                         */
                        field: taskFieldSchema,
                        /**
                         * Sort order. Can be either ascending or descending.
                         */
                        order: z.enum(["asc", "desc"]).default("asc"),
                    })
                    .optional(),
                filters: z
                    .array(
                        z.object({
                            fieldPath: z.string(),
                            // Possibly add more operators in the future.
                            operation: z.enum(["contains"]),
                            comparedValue: z.string(),
                        })
                    )
                    .optional(),
            })
        )
        .query(
            async (
                opts
            ): Promise<{ data: TaskWithDeadline[]; count: number }> => {
                const userRoleTitles = opts.ctx.session.user.roleTitles;

                const filters: Prisma.TaskWhereInput["AND"] = [];
                if (opts.input.filters) {
                    for (const filter of opts.input.filters) {
                        if (filter.fieldPath.startsWith(deadlinePrefix)) {
                            filters.push({
                                deadline: {
                                    [filter.fieldPath.slice(
                                        deadlinePrefix.length
                                    )]: {
                                        contains: filter.comparedValue,
                                    },
                                },
                            });
                        } else {
                            filters.push({
                                [filter.fieldPath]: {
                                    contains: filter.comparedValue,
                                },
                            });
                        }
                    }
                }

                const orderBy: Prisma.TaskOrderByWithRelationInput = {};
                if (opts.input.sort) {
                    if (opts.input.sort.field.startsWith(deadlinePrefix)) {
                        orderBy.deadline = {};
                        orderBy.deadline[
                            opts.input.sort.field.slice(
                                deadlinePrefix.length
                            ) as keyof Prisma.DeadlineOrderByWithRelationInput
                        ] = opts.input.sort.order;
                    } else
                        orderBy[
                            opts.input.sort
                                .field as keyof Prisma.TaskOrderByWithRelationInput
                        ] = opts.input.sort.order;
                }

                if (
                    userRoleTitles.includes(UserRoleTitles.ZADAVATEL_DOTAZNIKU)
                ) {
                    const [data, count] = await opts.ctx.prisma.$transaction([
                        opts.ctx.prisma.task.findMany({
                            where: {
                                AND: filters,
                            },
                            include: {
                                deadline: true,
                            },
                            skip: opts.input.pagination.offset,
                            take: opts.input.pagination.limit,
                            orderBy,
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
                                AND: filters,
                            },
                            include: {
                                deadline: true,
                            },
                            skip: opts.input.pagination.offset,
                            take: opts.input.pagination.limit,
                            orderBy,
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

            const user = await loadClientsAndPatients({
                token: opts.ctx.session.user.formioToken,
                pagination: {
                    limit: 1,
                    offset: 0,
                },
                filters: [
                    {
                        fieldPath: "data.id",
                        operation: "contains",
                        comparedValue: opts.input.forUserId,
                    },
                ],
            });

            if (user === undefined || user.data.length === 0)
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
