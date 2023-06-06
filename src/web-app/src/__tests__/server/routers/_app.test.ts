import { appRouter, type AppRouter } from "@/server/routers/_app";
import { createInnerTRPCContext } from "@/server/trpc";
import { type inferProcedureInput } from "@trpc/server";
import { beforeEach, expect, it } from "vitest";

declare module "vitest" {
    export interface TestContext {
        trpcCtx: ReturnType<typeof createInnerTRPCContext>;
    }
}

beforeEach((ctx) => {
    ctx.trpcCtx = createInnerTRPCContext({
        session: {
            user: {
                _id: "1234",
                data: { id: "123" },
                roles: [],
                access: [],
                created: "",
                owner: "",
                form: "",
                roleTitles: [],
                formioToken: "",
            },
            expires: "1",
        },
    });
});

it("returns created todo", async ({ trpcCtx }) => {
    const caller = appRouter.createCaller(trpcCtx);

    type Input = inferProcedureInput<AppRouter["createTask"]>;
    const inputTask: Input = {
        name: "test",
    };

    const createdTask = await caller.createTask(inputTask);

    expect(createdTask).toMatchObject({ ...inputTask, id: expect.any(Number) });
});

it("lists todos", async ({ trpcCtx }) => {
    const caller = appRouter.createCaller(trpcCtx);

    const numberOfTasks = 10;
    // create tasks to list
    for (let i = 0; i < numberOfTasks; i++) {
        await caller.createTask({
            name: `test ${i}`,
        });
    }

    const tasks = await caller.listTasks();

    // check that all tasks are present in the returned list
    for (let i = 0; i < numberOfTasks; i++) {
        expect(tasks).toContainEqual({
            name: `test ${i}`,
            id: expect.any(Number),
        });
    }
});

it("deletes todo", async ({ trpcCtx }) => {
    const caller = appRouter.createCaller(trpcCtx);

    const createdTask = await caller.createTask({
        name: "test",
    });

    expect(async () => {
        await caller.deleteTask({
            id: createdTask.id,
        });
    }).not.toThrow();

    const result = await caller.getTask({ id: createdTask.id });

    expect(result).toBeNull();
});
