import { z } from "zod";
import { prisma } from "../db";

const getSchema = z.coerce.number();

/**
 * Get task by ID
 */
export async function GET(
    request: Request,
    context: { params: { taskId: string } }
) {
    const response = getSchema.safeParse(context.params.taskId);
    if (!response.success)
        return new Response(JSON.stringify({ error: response.error }), {
            status: 400,
        });

    const result = await prisma.task.findUnique({
        where: {
            id: response.data,
        },
    });

    if (result) return new Response(JSON.stringify(result));
    else return new Response("Not found", { status: 404 });
}
