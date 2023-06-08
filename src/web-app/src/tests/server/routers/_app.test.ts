import { loadForm } from "@/client/formioClient";
import { appRouter, type AppRouter } from "@/server/routers/_app";
import { createInnerTRPCContext } from "@/server/trpc";
import { Form } from "@/types/form";
import { UserRoleTitles } from "@/types/users";
import { type inferProcedureInput } from "@trpc/server";
import { expect, it, vi } from "vitest";

type CreateTaskInput = inferProcedureInput<AppRouter["createTask"]>;
const mockInputTask: CreateTaskInput = {
    name: "test",
    forUserId: "123",
    description: "test",
    formId: "123",
};

vi.mock("@/client/formioClient", () => ({ loadForm: vi.fn() }));

function createInnerTRPCContextMockSession(
    roleTitles: string[],
    userId?: string
) {
    return createInnerTRPCContext({
        session: {
            user: {
                _id: "1234",
                data: { id: userId ?? "123" },
                roles: [],
                access: [],
                created: "",
                owner: "",
                form: "",
                roleTitles,
                formioToken: "",
            },
            expires: "1",
        },
    });
}

it("returns created todo", async () => {
    const caller = appRouter.createCaller(
        createInnerTRPCContextMockSession([UserRoleTitles.ZAMESTNANEC])
    );

    vi.mocked(loadForm).mockImplementation(async () => {
        const mockForm: Form = {
            _id: mockInputTask.formId,
            created: "",
            name: "name",
            path: "/path",
            submissionAccess: [],
        };
        return mockForm;
    });
    const createdTask = await caller.createTask(mockInputTask);

    expect(createdTask).toMatchObject({
        ...mockInputTask,
        id: expect.any(Number),
    });
});

it("lists all todos as employee", async () => {
    const ctx = createInnerTRPCContextMockSession([UserRoleTitles.ZAMESTNANEC]);
    const caller = appRouter.createCaller(ctx);

    const numberOfTasks = 10;
    // create tasks to list
    for (let i = 0; i < numberOfTasks; i++) {
        await caller.createTask({
            ...mockInputTask,
            name: `test ${i}`,
        });
    }

    const tasks = await caller.listTasks();

    // check that all tasks are present in the returned list
    for (let i = 0; i < numberOfTasks; i++) {
        expect(tasks).toContainEqual({
            ...mockInputTask,
            name: `test ${i}`,
            id: expect.any(Number),
            isCompleted: false,
            updatedAt: expect.any(Date),
            createdByEmployeeId: ctx.session?.user.data.id,
            createdAt: expect.any(Date),
        });
    }
});

it("lists my todos as client/patient", async () => {
    const numberOfTasks = 10;
    const patientId = "12345";
    const createdTasks = [];
    // create tasks for patient
    {
        const employeeCtx = createInnerTRPCContextMockSession([
            UserRoleTitles.ZAMESTNANEC,
        ]);
        const employeeCaller = appRouter.createCaller(employeeCtx);

        // create tasks to list
        for (let i = 0; i < numberOfTasks; i++) {
            createdTasks.push(
                await employeeCaller.createTask({
                    ...mockInputTask,
                    name: `test ${i}`,
                    forUserId: patientId,
                })
            );
        }
    }
    // check that all tasks that were created are listed
    {
        const patientCtx = createInnerTRPCContextMockSession([
            UserRoleTitles.KLIENT_PACIENT,
        ], patientId);
        const patientCaller = appRouter.createCaller(patientCtx);
        const patientsTasks = await patientCaller.listTasks();

        // check that all tasks are present in the returned list
        for (let i = 0; i < numberOfTasks; i++) {
            expect(patientsTasks).toContainEqual(createdTasks[i]);
        }
    }
});

it("deletes todo", async () => {
    const caller = appRouter.createCaller(
        createInnerTRPCContextMockSession([UserRoleTitles.ZAMESTNANEC])
    );

    const createdTask = await caller.createTask(mockInputTask);

    await caller.deleteTask({
        id: createdTask.id,
    });

    const result = await caller.getTask({ id: createdTask.id });

    expect(result).toBeNull();
});
