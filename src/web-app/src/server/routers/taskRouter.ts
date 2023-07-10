import { loadFormById } from "@/client/formManagementClient";
import { loadUsers } from "@/client/userManagementClient";
import { UserRoleTitles } from "@/types/users";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const taskRouter = createTRPCRouter({
    /**
     * Get list of all tasks. If user is {@link UserRoleTitles.ZADAVATEL_DOTAZNIKU}, return all tasks.
     * If user is {@link UserRoleTitles.KLIENT_PACIENT}, return only tasks for them.
     */
    listTasks: protectedProcedure.query((opts) => {
        const userRoleTitles = opts.ctx.session.user.roleTitles;
        if (userRoleTitles.includes(UserRoleTitles.ZADAVATEL_DOTAZNIKU)) {
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
     * Get task by id.
     *
     * @throws {TRPCError} FORBIDDEN if the user is not a {@link UserRoleTitles.ZADAVATEL_DOTAZNIKU}
     * or {@link UserRoleTitles.KLIENT_PACIENT}
     * @throws {TRPCError} FORBIDDEN if the user is not an {@link UserRoleTitles.ZADAVATEL_DOTAZNIKU}
     * and the task is not assigned to them
     * @throws {TRPCError} NOT_FOUND if the task does not exist
     *
     * @returns {Prisma.Task} the task with given id
     */
    getTask: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async (opts) => {
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
     *
     * @throws {TRPCError} FORBIDDEN if the user is not an {@link UserRoleTitles.ZADAVATEL_DOTAZNIKU}
     * @throws {TRPCError} CONFLICT if the form with given formId does not exist
     * @throws {TRPCError} CONFLICT if the user with given forUserId does not exist
     * @throws {TRPCError} INTERNAL_SERVER_ERROR if the checking of form existence fails
     * @throws {TRPCError} INTERNAL_SERVER_ERROR if the creation of task fails
     * @throws {TRPCError} INTERNAL_SERVER_ERROR if the loading of users fails
     *
     * @returns {Prisma.Task} the created task
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
     * Delete task by id.
     *
     * @throws {TRPCError} FORBIDDEN if the user is not an {@link UserRoleTitles.ZADAVATEL_DOTAZNIKU}
     * @throws {TRPCError} NOT_FOUND if the task with given id does not exist
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
                    UserRoleTitles.ZADAVATEL_DOTAZNIKU
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

export default taskRouter;
