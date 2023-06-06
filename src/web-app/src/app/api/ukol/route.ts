import { z } from "zod";
import { prisma } from "../../../server/db";

const postReqSchema = z.object({
    name: z.string(),
});

/**
 * Create new task
 */
export async function POST(request: Request) {
    const response = postReqSchema.safeParse(await request.json());

    if (!response.success)
        return new Response(JSON.stringify({ error: response.error }), {
            status: 400,
        });

    const newTask = response.data;

    const res = await prisma.task.create({
        data: newTask,
    });

    return new Response(JSON.stringify(res), {
        status: 200,
    });
}

/**
 * Get list of all tasks
 */
export async function GET(request: Request) {
    const result = await prisma.task.findMany();

    return new Response(JSON.stringify(result));
}
