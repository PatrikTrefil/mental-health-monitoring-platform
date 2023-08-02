import { loadUsers, loginAdmin } from "@/client/userManagementClient";
import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const notFoundErrorCode = "P2025";

const postBodySchema = z.object({
    request: z.object({
        data: z.record(z.string(), z.unknown()).and(
            z.object({
                taskId: z.string(),
            })
        ),
        owner: z.string(),
        /**
         * Form id.
         */
        form: z.string(),
    }),
});

/**
 * Remove draft for form submission.
 * @param req - Request object.
 */
export async function POST(req: Request) {
    const body = postBodySchema.safeParse(await req.json());
    if (!body.success) {
        console.error(
            "Unexpected body in request to partially complete task",
            body.error
        );
        return new Response(JSON.stringify(body.error), { status: 400 });
    }

    const adminToken = await loginAdmin(
        process.env.FORMIO_ROOT_EMAIL,
        process.env.FORMIO_ROOT_PASSWORD
    );
    const users = await loadUsers(adminToken);
    const user = users.find((u) => u._id === body.data.request.owner);
    if (!user)
        return new Response(JSON.stringify({ error: "User not found" }), {
            status: 404,
        });

    console.debug(`Deleting draft`, {
        form: body.data.request.form,
        userId: user.data.id,
    });
    try {
        await prisma.draft.delete({
            where: {
                formId_userId: {
                    formId: body.data.request.form,
                    userId: user.data.id,
                },
            },
        });
    } catch (e) {
        console.debug("Error deleting draft", e);
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === notFoundErrorCode)
                return new Response(
                    JSON.stringify({ error: "Draft not found" }),
                    { status: 404 }
                );
        }
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500 }
        );
    }
    console.debug("Draft deleted", {
        form: body.data.request.form,
        userId: user.data.id,
    });
    return new Response("OK", { status: 200 });
}
