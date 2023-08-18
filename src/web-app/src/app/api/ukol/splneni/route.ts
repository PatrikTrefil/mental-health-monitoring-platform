import { loadFormById, loadSubmission } from "@/client/formManagementClient";
import { loginAdmin } from "@/client/userManagementClient";
import { prisma } from "@/server/db";
import { Prisma, TaskState } from "@prisma/client";
import { z } from "zod";

const postBodySchema = z.object({
    request: z.object({
        data: z
            .record(z.string(), z.unknown())
            .and(z.object({ taskId: z.string() })),
        owner: z.string(),
        access: z.string().array(),
        /**
         * Form id.
         */
        form: z.string(),
    }),
    submission: z.object({
        _id: z.string(),
    }),
});

/**
 * Complete a task by providing a form submission.
 * @param req - Request object.
 */
export async function POST(req: Request) {
    // token is present and valid because of middleware checks
    const formioToken = req.headers.get("x-jwt-token")!;

    const body = postBodySchema.safeParse(await req.json());
    if (!body.success) {
        console.error(
            "Unexpected body in request to complete task",
            body.error
        );
        return new Response(JSON.stringify(body.error), { status: 400 });
    }

    const success = await validateRequest(
        body.data.request.form,
        formioToken,
        body.data.request.data.taskId,
        body.data.submission._id,
        body.data.request.owner
    );

    if (!success) {
        console.error("Invalid submission for task");
        return new Response("Submission is not valid for this task", {
            status: 400,
        });
    }

    try {
        await prisma.task.updateMany({
            where: {
                id: body.data.request.data.taskId,
                state: TaskState.PARTIALLY_COMPLETED,
            },
            data: {
                state: TaskState.COMPLETED,
                submissionId: body.data.submission._id,
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
    console.log("Task completed", {
        taskId: body.data.request.data.taskId,
        submissionId: body.data.submission._id,
    });
    return new Response("Task completed", { status: 200 });
}

/**
 * Validate that the submission can be used to complete the task.
 *
 * This is done by loading the submission from Formio (the provided
 * input can not be trusted) and checking that the submission exists,
 * is associated with the same form that the task is associated with.
 * We also check that the task exists;.
 * @param formId - Id of the form assigned to the task.
 * @param formioToken - JWT token for formio.
 * @param taskId - Id of the task to be completed.
 * @param submissionId - Id of the submission used to complete the task.
 * @param userId - Id of the user that is completing the task.
 * @returns True if the submission is valid for the task.
 */
async function validateRequest(
    formId: string,
    formioToken: string,
    taskId: string,
    submissionId: string,
    userId: string
): Promise<boolean> {
    // make sure the task exists and that it is for the correct form
    let task: { formId: string } | null;
    try {
        task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
            select: {
                formId: true,
            },
        });
    } catch (e) {
        console.error("Loading task failed", e);
        return false;
    }
    if (task === null) {
        console.error("Task with given id does not exist");
        return false;
    }
    if (task.formId === null || task.formId !== formId) {
        console.error(
            "Task is not associated with the form which is tied to the submission"
        );
        return false;
    }

    // make sure a submission with given id exists and is accociated with the form
    let form: Awaited<ReturnType<typeof loadFormById>>;
    try {
        form = await loadFormById(formId, formioToken);
    } catch (e) {
        console.error("Loading form failed", e);
        return false;
    }
    if (!form) {
        console.error("The form that the submission is tied to does not exist");
        return false;
    }

    let adminToken: string;
    try {
        adminToken = await loginAdmin(
            process.env.FORMIO_ROOT_EMAIL,
            process.env.FORMIO_ROOT_PASSWORD
        );
    } catch (e) {
        console.error("Failed to login as admin", e);
        return false;
    }

    let trustedSubmission: Awaited<ReturnType<typeof loadSubmission>>;
    try {
        trustedSubmission = await loadSubmission(
            form.path,
            submissionId,
            adminToken // needs to be admin token, because user's can't read their own submissions (see issue #158)
        );
    } catch (e) {
        console.error("Loading submission failed", e);
        return false;
    }
    if (trustedSubmission === null) {
        console.error("Loading submission failed (not found)");
        return false;
    }

    if (trustedSubmission.owner !== userId) {
        console.error("The submission is not owned by the user");
        return false;
    }
    if (trustedSubmission.data.taskId !== taskId) {
        console.error(
            "The submission is not associated with the task that is to be completed"
        );
        return false;
    }
    return true;
}
