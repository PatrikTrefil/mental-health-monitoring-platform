import { prisma } from "@/server/db";
import { Prisma, TaskState } from "@prisma/client";
import { z } from "zod";

const notFoundErrorCode = "P2025";

/**
 * Bode request schema for API endpoint {@link POST}.
 */
const postBodySchema = z.object({
    request: z.object({
        data: z.record(z.string(), z.unknown()).and(
            z.object({
                taskId: z.string(),
            })
        ),
        owner: z.string(),
        access: z.string().array(),
        /**
         * Form id.
         */
        form: z.string(),
    }),
});

/**
 * Partially complete a task by providing a form submission.
 * @param req - Request object.
 * @returns
 * Response with status 200 if successful.
 * Response with status 500 if there was a server error.
 * Response with status 409 if task either does not exist or
 * was expecting a submission to a different form or
 * was already completed or deadline has passed.
 */
export async function POST(req: Request) {
    // route is protected by middleware

    const body = postBodySchema.safeParse(await req.json());
    if (!body.success) {
        console.error(
            "Unexpected body in request to partially complete task",
            body.error
        );
        return new Response(JSON.stringify(body.error), { status: 400 });
    }

    console.info(
        `Partially completing task ${body.data.request.data.taskId}...`
    );

    try {
        await partiallyCompleteTask(
            body.data.request.data.taskId,
            body.data.request.form
        );
    } catch (e) {
        console.error(e);
        if (e instanceof Prisma.PrismaClientKnownRequestError)
            return new Response("Server error", { status: 500 });

        return new Response(
            "Task either does not exist or was expecting a submission to a different form or was already completed or deadline has passed",
            { status: 409 }
        );
    }

    console.info(
        `Task with id ${body.data.request.data.taskId} partially completed`
    );

    return new Response("OK", {
        status: 200,
    });
}

/**
 * Change state of task to partially completed if possible.
 * @param id - Id of the task to complete.
 * @param formId - Id of the form to which the submission belongs.
 * @throws {Prisma.PrismaClientKnownRequestError}
 * If the operation fails because of a database error.
 * @throws {Error}
 * If trying to partially complete a task after a deadline which cannot
 * be completed after deadline or if the task is not in a {@link TaskState.UNCOMPLETED} state.
 */
async function partiallyCompleteTask(
    id: string,
    formId: string
): Promise<void> {
    // mark the task as completed if it is not already completed and the deadline
    // is either not set, not "hard" (canBeCompletedAfterDeadline: true) or has not passed
    // and the start date is not set or it has already passed
    const result = await prisma.task.updateMany({
        where: {
            AND: [
                {
                    id,
                    state: TaskState.UNCOMPLETED,
                    submissionId: null,
                    formId,
                },
                {
                    OR: [
                        {
                            deadline: null,
                        },
                        {
                            deadline: {
                                canBeCompletedAfterDeadline: {
                                    equals: true,
                                },
                            },
                        },
                        {
                            deadline: {
                                dueDateTime: {
                                    gte: new Date(),
                                },
                            },
                        },
                    ],
                },
                {
                    OR: [
                        {
                            start: { equals: null },
                        },
                        {
                            start: {
                                lte: new Date(),
                            },
                        },
                    ],
                },
            ],
        },
        data: {
            state: TaskState.PARTIALLY_COMPLETED,
        },
    });

    if (result.count === 0)
        throw new Error(
            `Task either does not exist or was expecting a submission to a different form or was already completed or deadline has passed`
        );
}
