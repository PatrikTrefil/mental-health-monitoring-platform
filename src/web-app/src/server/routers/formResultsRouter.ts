import {
    loadFormById,
    loadSubmission,
    loadSubmissions,
} from "@/client/formManagementClient";
import UserRoleTitles from "@/constants/userRoleTitles";
import { Submission } from "@/types/formManagement/submission";
import { Prisma, TaskState } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Session } from "next-auth";
import { z } from "zod";
import { prisma } from "../db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TaskWithDeadline } from "./taskRouter";

const formResultsRouter = createTRPCRouter({
    /**
     * Form results data joined with task data.
     * @throws {TRPCError} - If the user does not have any of the required roles - {@link UserRoleTitles.ASSIGNER}, {@link UserRoleTitles.FORM_MANAGER}.
     * @throws {TRPCError} - If the form with given ID does not exist.
     */
    getFormResults: protectedProcedure
        .input(
            z.object({
                formId: z.string(),
                sort: z
                    .object({
                        /**
                         * Field to sort by. If the field is nested withing the task object, use dot notation.
                         * @example "name"
                         * @example "deadline.dueDateTime"
                         */
                        field: z.string(),
                        /**
                         * Sort order. Can be either ascending or descending.
                         */
                        order: z.enum(["asc", "desc"]).default("asc"),
                    })
                    .optional(),
                filter: z
                    .object({
                        fieldPath: z.string(),
                        // Possibly add more operators in the future.
                        operation: z.enum(["contains"]),
                        comparedValue: z.string(),
                    })
                    .optional(),
            })
        )
        .query(
            async (
                opts
            ): Promise<{
                data: {
                    task: TaskWithDeadline | null;
                    submission: Submission | null;
                }[];
                totalCount: number;
            }> => {
                validatePermissions(opts.ctx.session);

                let dataToReturn = await getJoinedTasksAndSubmissions(
                    opts.input.formId,
                    opts.ctx.session.user.formioToken,
                    opts.input.filter
                );

                if (opts.input.sort !== undefined) {
                    sortByField(
                        dataToReturn.data,
                        opts.input.sort!.field,
                        opts.input.sort!.order === "desc"
                    );
                }
                return dataToReturn;
            }
        ),
});

export default formResultsRouter;

/**
 * Get tasks and submissions data joined on id of the form they are associated with.
 * @param formId - The ID of the form to load data for.
 * @param token - The token to use to authenticate with the form management API.
 * @param filter - The filter to apply to the submissions.
 * @param filter.comparedValue - The value to compare the field to.
 * @param filter.fieldPath - The path of the field to compare.
 * @param filter.operation - The operation to use to compare the field to the compared value.
 * @returns Unsorted joined data about tasks and submissions for a particular form.
 */
async function getJoinedTasksAndSubmissions(
    formId: string,
    token: string,
    filter?: { comparedValue: string; fieldPath: string; operation: "contains" }
): Promise<{
    data: {
        submission: Submission | null;
        task: TaskWithDeadline | null;
    }[];
    totalCount: number;
}> {
    if (filter && filter.fieldPath.startsWith("submission")) {
        const { submissions, totalCount } = await loadAllSubmissions(
            formId,
            token,
            {
                comparedValue: filter.comparedValue,
                fieldPath: filter.fieldPath.slice("submission.".length),
                operation: filter.operation,
            }
        );
        let taskPromises: Promise<TaskWithDeadline | null>[] = [];
        for (const submission of submissions) {
            taskPromises.push(
                prisma.task.findFirst({
                    where: {
                        submissionId: submission._id,
                    },
                    include: {
                        deadline: true,
                    },
                })
            );
        }
        const tasks = await Promise.allSettled(taskPromises);
        return {
            data: tasks.map((task, i) => {
                if (task.status === "fulfilled") {
                    return {
                        submission: submissions[i]!,
                        task: task.value!,
                    };
                } else {
                    return {
                        submission: submissions[i]!,
                        task: null,
                    };
                }
            }),
            totalCount,
        };
    } else {
        const { tasks, count } = await loadAllTasksForForm(formId, filter);
        if (tasks === undefined) {
            return { data: [], totalCount: 0 };
        } else {
            const submissionPromises: Promise<Submission | null>[] = [];
            const form = await loadFormById(formId, token);
            if (form === null) throw new TRPCError({ code: "NOT_FOUND" });
            for (const task of tasks) {
                if (task.submissionId)
                    submissionPromises.push(
                        loadSubmission(form?.path, task.submissionId, token)
                    );
            }
            const submissions = await Promise.allSettled(submissionPromises);
            return {
                data: submissions.map((submission, i) => {
                    if (submission.status === "fulfilled") {
                        return {
                            submission: submission.value!,
                            task: tasks[i]!,
                        };
                    } else {
                        return {
                            submission: null,
                            task: tasks[i]!,
                        };
                    }
                }),
                totalCount: count,
            };
        }
    }
}

/**
 * Validate that the user has the required permissions to access the form results.
 * @param session - The session of the user.
 * @throws {TRPCError} - If the user does not have any of the required roles - {@link UserRoleTitles.ASSIGNER}, {@link UserRoleTitles.FORM_MANAGER}.
 */
function validatePermissions(session: Session) {
    if (
        !(
            session.user.roleTitles.includes(UserRoleTitles.FORM_MANAGER) ||
            session.user.roleTitles.includes(UserRoleTitles.ASSIGNER)
        )
    )
        throw new TRPCError({ code: "FORBIDDEN" });
}

/**
 * Load all submissions that match the given filter. This function does not support pagination.
 * @param formId - The ID of the form to load submissions from.
 * @param token - The token to use to authenticate with the form management API.
 * @param filter - The filter to apply to the submissions.
 * @param filter.comparedValue - The value to compare the field to.
 * @param filter.fieldPath - The path of the field to compare.
 * @param filter.operation - The operation to use to compare the field to the compared value.
 */
async function loadAllSubmissions(
    formId: string,
    token: string,
    filter?: { comparedValue: string; fieldPath: string; operation: "contains" }
): Promise<{ submissions: Submission[]; totalCount: number }> {
    const submissions: Submission[] = [];
    let totalCount = 1; // Init to 1 so that the loop runs at least once (overwritten at the end of every iteration).
    while (totalCount > submissions.length) {
        const currResult = await loadSubmissions(formId, {
            token,
            pagination: {
                limit: 100,
                offset: submissions.length,
            },
            filters: filter !== undefined ? [filter] : undefined,
        });
        submissions.push(...currResult.data);
        totalCount = currResult.totalCount;
    }
    return { submissions, totalCount };
}

/**
 * Load all tasks for a form that match the given filter.
 * @param formId - The ID of the form to load tasks for.
 * @param filter - The filter to apply to the tasks.
 * @param filter.comparedValue - The value to compare the field to.
 * @param filter.fieldPath - The path of the field to compare.
 * @param filter.operation - The operation to use to compare the field to the compared value.
 */
async function loadAllTasksForForm(
    formId: string,
    filter?: { comparedValue: string; fieldPath: string; operation: "contains" }
): Promise<{ tasks: TaskWithDeadline[]; count: number }> {
    const filters: Prisma.TaskWhereInput["AND"] = [];
    if (filter && filter.fieldPath.startsWith("task")) {
        const taskPrefix = "task.";
        const deadlinePrefix = "deadline.";
        if (filter.fieldPath.startsWith(deadlinePrefix)) {
            filters.push({
                deadline: {
                    [filter.fieldPath.slice(
                        taskPrefix.length + deadlinePrefix.length
                    )]: {
                        contains: filter.comparedValue,
                    },
                },
            });
        } else {
            filters.push({
                [filter.fieldPath.slice(taskPrefix.length)]: {
                    contains: filter.comparedValue,
                },
            });
        }
    }
    const [tasks, count] = await prisma.$transaction([
        prisma.task.findMany({
            where: {
                formId: formId,
                AND: {
                    state: TaskState.COMPLETED,
                    AND: filters,
                },
            },
            include: {
                deadline: true,
            },
        }),
        prisma.task.count({
            where: {
                formId: formId,
                AND: {
                    state: TaskState.COMPLETED,
                    AND: filters,
                },
            },
        }),
    ]);
    return { tasks, count };
}

/**
 * Sort data in place by field, which is defined by a dot-separated path.
 * The given data array is mutated.
 * Values are considered equal if they do not exist on the objects.
 * Values are considered equal if they are not a number or string.
 * @param data - The data to sort.
 * @param fieldPathStr - The path of the field to sort by.
 * @param reverse - Whether to sort in reverse order.
 * @returns The sorted data (reference to the original array, which has been mutated).
 */
function sortByField(data: any[], fieldPathStr: string, reverse = false) {
    const fieldPath = fieldPathStr.split(".");
    data.sort((a, b) => {
        let aValue: any = a;
        let bValue: any = b;
        for (const key of fieldPath) {
            if (
                typeof aValue === "object" &&
                typeof bValue === "object" &&
                aValue !== null &&
                bValue !== null &&
                key in aValue &&
                key in bValue
            ) {
                aValue = aValue[key];
                bValue = bValue[key];
            } else {
                return 0;
            }
        }
        if (typeof aValue === "string" && typeof bValue === "string") {
            return aValue.localeCompare(bValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
            return aValue - bValue;
        } else {
            return 0;
        }
    });
    if (reverse) data.reverse();
    return data;
}
