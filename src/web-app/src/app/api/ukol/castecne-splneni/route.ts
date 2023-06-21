import TaskState from "@/constants/taskState";
import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";

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
         * Form id
         */
        form: z.string(),
    }),
});

/**
 * Complete a task by providing a form submission
 * @returns 200 if successful
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

    // we need to check that this submission has not been used already to complete a task
    try {
        // mark the task as completed
        await prisma.task.updateMany({
            where: {
                id: body.data.request.data.taskId,
                state: TaskState.READY,
                submissionId: null,
                formId: body.data.request.form,
            },
            data: {
                state: TaskState.PARTIALLY_COMPLETED,
            },
        });
    } catch (e) {
        console.error(e);
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            const recordNotFoundCode = "P2018";
            if (e.code === recordNotFoundCode)
                return new Response(
                    "Task either does not exist or was expecting a submission to a different form or was already completed",
                    { status: 409 }
                );
        }
        return new Response("Failed to update task", { status: 500 });
    }
    console.log(
        `Task with id ${body.data.request.data.taskId} partially completed`
    );
    return new Response("OK", {
        status: 200,
    });
}
