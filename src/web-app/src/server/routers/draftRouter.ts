import UserRoleTitles from "@/constants/userRoleTitles";
import { Prisma, type Draft } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const notFoundErrorCode = "P2025";

const draftDataSchema = z.record(z.string(), z.unknown());

const draftRouter = createTRPCRouter({
    /**
     * Update or insert a draft.
     * @param string - Input.formId the if of the form to update/insert a draft for.
     * @param unknown - Input.data the draft data.
     * @returns The updated/inserted draft.
     * @throws {TRPCError}
     * FORBIDDEN if the user is not a {@link UserRoleTitles.ASSIGNEE}.
     * @throws {TRPCError}
     * INTERNAL_SERVER_ERROR if the database operation fails.
     * @throws {TRPCError}
     * CUSTOM if the data can not be stringified to JSON.
     */
    upsertDraft: protectedProcedure
        .input(
            z.object({
                formId: z.string(),
                data: draftDataSchema.transform((data, ctx) => {
                    try {
                        return JSON.stringify(data);
                    } catch (e) {
                        ctx.addIssue({
                            message: "Data can not be stringified to JSON",
                            code: z.ZodIssueCode.custom,
                        });
                        return z.NEVER;
                    }
                }),
            })
        )
        .mutation(async (opts): Promise<Draft> => {
            if (
                !opts.ctx.session.user.roleTitles.includes(
                    UserRoleTitles.ASSIGNEE
                )
            )
                throw new TRPCError({ code: "FORBIDDEN" });

            try {
                return await opts.ctx.prisma.draft.upsert({
                    where: {
                        formId_userId: {
                            formId: opts.input.formId,
                            userId: opts.ctx.session.user.data.id,
                        },
                    },
                    update: {
                        data: opts.input.data,
                    },
                    create: {
                        formId: opts.input.formId,
                        userId: opts.ctx.session.user.data.id,
                        data: opts.input.data,
                    },
                });
            } catch (e) {
                console.error(e);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }
        }),
    /**
     * Get a draft by form id.
     * @param string - Input.formId the id of the form to get the draft for.
     * @returns The requested draft.
     * @throws {TRPCError}
     * FORBIDDEN if the user is not a {@link UserRoleTitles.ASSIGNEE}.
     * @throws {TRPCError}
     * INTERNAL_SERVER_ERROR if the database operation fails.
     * @throws {TRPCError}
     * NOT_FOUND if the draft does not exist.
     */
    getDraft: protectedProcedure.input(z.object({ formId: z.string() })).query(
        async (
            opts
        ): Promise<{
            formId: string;
            userId: string;
            data: z.infer<typeof draftDataSchema>;
        }> => {
            if (
                !opts.ctx.session.user.roleTitles.includes(
                    UserRoleTitles.ASSIGNEE
                )
            )
                throw new TRPCError({ code: "FORBIDDEN" });

            let result: Awaited<
                ReturnType<typeof opts.ctx.prisma.draft.findUnique>
            >;
            try {
                result = await opts.ctx.prisma.draft.findUnique({
                    where: {
                        formId_userId: {
                            formId: opts.input.formId,
                            userId: opts.ctx.session.user.data.id,
                        },
                    },
                });
            } catch (e) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }
            if (result === null) throw new TRPCError({ code: "NOT_FOUND" });

            return {
                ...result,
                data: JSON.parse(result.data) as z.infer<
                    typeof draftDataSchema
                >,
            };
        }
    ),
    /**
     * Delete a draft by form id.
     * @param string - Input.formId the id of the form to delete the draft for.
     * @throws {TRPCError}
     * FORBIDDEN if the user is not a {@link UserRoleTitles.ASSIGNEE}.
     * @throws {TRPCError}
     * INTERNAL_SERVER_ERROR if the database operation fails.
     * @throws {TRPCError}
     * NOT_FOUND if the draft does not exist.
     */
    deleteDraft: protectedProcedure
        .input(z.object({ formId: z.string() }))
        .mutation(async (opts): Promise<Draft> => {
            if (
                !opts.ctx.session.user.roleTitles.includes(
                    UserRoleTitles.ASSIGNEE
                )
            )
                throw new TRPCError({ code: "FORBIDDEN" });

            try {
                return await opts.ctx.prisma.draft.delete({
                    where: {
                        formId_userId: {
                            formId: opts.input.formId,
                            userId: opts.ctx.session.user.data.id,
                        },
                    },
                });
            } catch (e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    if (e.code === notFoundErrorCode)
                        throw new TRPCError({ code: "NOT_FOUND" });
                }
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }
        }),
});

export default draftRouter;
