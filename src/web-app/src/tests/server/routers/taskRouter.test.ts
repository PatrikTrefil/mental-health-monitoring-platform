import { loadFormById } from "@/client/formManagementClient";
import { loadAssignees } from "@/client/userManagementClient";
import UserRoleTitles from "@/constants/userRoleTitles";
import { prisma } from "@/server/__mocks__/db";
import { appRouter, type AppRouter } from "@/server/routers/root";
import { faker } from "@faker-js/faker";
import { Prisma, TaskState } from "@prisma/client";
import { inferProcedureOutput, type inferProcedureInput } from "@trpc/server";
import { describe, expect, it, vi } from "vitest";
import {
    createInnerTRPCContextMockSession,
    createInnerTRPCContextNoSession,
} from "./utility";

type CreateTaskInput = inferProcedureInput<AppRouter["task"]["createTask"]>;
type CreateTaskOutput = inferProcedureOutput<AppRouter["task"]["createTask"]>;

const mockInputTask: CreateTaskInput & {
    description: string;
    start: Date;
    deadline: { dueDateTime: Date; canBeCompletedAfterDeadline: boolean };
} = {
    name: "foo",
    forUserId: faker.string.uuid(),
    description: "bar",
    formId: faker.string.uuid(),
    start: faker.date.future(),
    deadline: {
        dueDateTime: faker.date.future(),
        canBeCompletedAfterDeadline: false,
    },
};

const mockOutputTaskExpectationTemplate: CreateTaskOutput = {
    ...mockInputTask,
    id: expect.any(String),
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
    createdByEmployeeId: expect.any(String),
    state: TaskState.READY,
    submissionId: null,
    deadline: {
        dueDateTime: expect.any(Date),
        canBeCompletedAfterDeadline: expect.any(Boolean),
        taskId: expect.any(String),
    },
};

vi.mock("@/server/db");

vi.mock("@/client/formManagementClient", () => ({
    loadFormById: vi.fn(async () => {
        const mockForm: Awaited<ReturnType<typeof loadFormById>> = {
            _id: "123",
            title: "",
            name: "test",
            path: "test",
            created: "",
            submissionAccess: [],
            components: [],
        };
        return mockForm;
    }),
}));

vi.mock("@/client/userManagementClient", () => ({
    loadClientsAndPatients: vi.fn(async () => {
        const mockUsers: Awaited<ReturnType<typeof loadAssignees>> = {
            data: [
                {
                    _id: "12324",
                    data: { id: "123" },
                    created: "",
                    owner: "",
                    access: [],
                    form: "",
                    roles: [],
                    metadata: {},
                },
            ],
            totalCount: 1,
        };
        return mockUsers;
    }),
}));

describe("todo functionality", () => {
    it("returns created todo as employee", async () => {
        const employeeCtx = createInnerTRPCContextMockSession([
            UserRoleTitles.ASSIGNER,
        ]);
        const caller = appRouter.createCaller(employeeCtx);

        vi.mocked(loadFormById).mockResolvedValueOnce({
            _id: mockInputTask.formId,
            title: "",
            created: "",
            name: "name",
            path: "/path",
            submissionAccess: [],
            components: [],
        });
        vi.mocked(loadAssignees).mockResolvedValueOnce({
            data: [
                {
                    _id: faker.string.uuid(),
                    data: { id: mockInputTask.forUserId },
                    access: [],
                    created: faker.date.past().toISOString(),
                    form: faker.string.uuid(),
                    metadata: {},
                    owner: faker.string.uuid(),
                    roles: [],
                },
            ],
            totalCount: 1,
        });
        if (!employeeCtx.session) throw new Error("no session");

        prisma.task.create.mockResolvedValueOnce({
            ...mockOutputTaskExpectationTemplate,
        });
        const createdTask = await caller.task.createTask(mockInputTask);

        expect(createdTask).toMatchObject(mockOutputTaskExpectationTemplate);
    });

    it("get existing todo as patient", async () => {
        // arrange
        const clientCtx = createInnerTRPCContextMockSession(
            [UserRoleTitles.ASSIGNEE],
            mockInputTask.forUserId
        );
        const clientCaller = appRouter.createCaller(clientCtx);

        if (!clientCtx.session) throw new Error("no session");

        // act
        const mockTaskId = faker.string.uuid();
        prisma.task.findUnique.mockResolvedValueOnce({
            ...mockInputTask,
            id: mockTaskId,
            createdAt: faker.date.past(),
            updatedAt: faker.date.past(),
            createdByEmployeeId: faker.string.uuid(),
            state: TaskState.READY,
            submissionId: null,
            forUserId: clientCtx.session.user.data.id,
            // @ts-expect-error I have no idea how to use the other findUnique overload which includes the deadline object for mocking
            deadline: {
                ...mockInputTask.deadline,
                taskId: mockTaskId,
            },
        });
        const receivedTask = await clientCaller.task.getTask({
            id: mockTaskId,
        });

        console.log({ receivedTask });
        // assert
        expect(receivedTask).toMatchObject(mockOutputTaskExpectationTemplate);
    });

    it("throws when getting non-existing todo as employee", async () => {
        const caller = appRouter.createCaller(
            createInnerTRPCContextMockSession([UserRoleTitles.ASSIGNER])
        );
        const todoId = faker.string.uuid();

        prisma.task.findUnique.mockImplementationOnce(() => {
            throw new Prisma.PrismaClientKnownRequestError("Not found", {
                code: "P2025",
                clientVersion: "",
            });
        });

        expect(() =>
            caller.task.getTask({ id: todoId })
        ).rejects.toThrowError();
    });

    it("list of all todos contains created todos as employee", async () => {
        const ctx = createInnerTRPCContextMockSession([
            UserRoleTitles.ASSIGNER,
        ]);
        const caller = appRouter.createCaller(ctx);

        if (!ctx.session) throw new Error("no session");
        const numberOfTasks = 10;
        const mockTasks = [];
        for (let i = 0; i < numberOfTasks; i++) {
            mockTasks.push({
                ...mockInputTask,
                name: `test ${i}`,
                id: faker.string.uuid(),
                updatedAt: faker.date.past(),
                createdByEmployeeId: ctx.session.user.data.id,
                createdAt: faker.date.past(),
                state: TaskState.READY,
                submissionId: null,
            });
        }

        prisma.$transaction.mockResolvedValueOnce([
            mockTasks.map((t) => ({ ...t, deadline: null })),
            mockTasks.length,
        ]);
        const tasks = await caller.task.listTasks({
            pagination: { limit: 10, offset: 0 },
        });

        if (!ctx.session?.user.data.id) throw new Error("Session is null");

        // check that all tasks are present in the returned list
        for (let i = 0; i < numberOfTasks; i++) {
            const expectedTask: Awaited<
                ReturnType<typeof caller.task.listTasks>
            >["data"][number] = {
                ...mockInputTask,
                name: `test ${i}`,
                id: expect.any(String),
                updatedAt: expect.any(Date),
                createdByEmployeeId: ctx.session.user.data.id,
                createdAt: expect.any(Date),
                state: TaskState.READY,
                submissionId: null,
                deadline: null,
            };
            expect(tasks.data).toContainEqual(expectedTask);
        }
    });

    it("lists my todos as client/patient", async () => {
        const numberOfTasks = 10;
        const patientId = faker.string.uuid();
        const createdTasks = new Array<
            inferProcedureOutput<AppRouter["task"]["listTasks"]>["data"][number]
        >(numberOfTasks);
        for (let i = 0; i < numberOfTasks; i++) {
            createdTasks[i] = {
                ...mockInputTask,
                name: `test ${i}`,
                forUserId:
                    i > numberOfTasks / 2 ? patientId : faker.string.uuid(), // make some tasks for other users
                createdAt: faker.date.past(),
                updatedAt: faker.date.past(),
                createdByEmployeeId: faker.string.uuid(),
                state: TaskState.READY,
                submissionId: null,
                description: "",
                id: faker.string.uuid(),
                deadline: null,
            };
        }
        // check that all tasks that were created are listed
        const patientCtx = createInnerTRPCContextMockSession(
            [UserRoleTitles.ASSIGNEE],
            patientId
        );
        const patientCaller = appRouter.createCaller(patientCtx);
        prisma.$transaction.mockResolvedValueOnce([
            createdTasks,
            createdTasks.length,
        ]);
        const patientsTasks = await patientCaller.task.listTasks({
            pagination: { limit: 10, offset: 0 },
        });

        // assert
        for (const createdTask of createdTasks) {
            if (createdTask.forUserId === patientId)
                expect(patientsTasks.data).toContainEqual(createdTask);
        }
    });

    it("deletes an existing todo as employee", async () => {
        const employeeCtx = createInnerTRPCContextMockSession([
            UserRoleTitles.ASSIGNER,
        ]);
        const caller = appRouter.createCaller(employeeCtx);

        const mockTaskId = faker.string.uuid();
        await caller.task.deleteTask({
            id: mockTaskId,
        });

        expect(prisma.task.delete).toHaveBeenCalledWith({
            where: {
                id: mockTaskId,
            },
        });
    });

    it("throws not found when deleting a non-existing todo as employee", async () => {
        const caller = appRouter.createCaller(
            createInnerTRPCContextMockSession([UserRoleTitles.ASSIGNER])
        );

        prisma.task.delete.mockImplementationOnce(() => {
            throw new Prisma.PrismaClientKnownRequestError("Not found", {
                code: "P2025",
                clientVersion: "",
            });
        });
        await expect(
            caller.task.deleteTask({
                id: faker.string.uuid(),
            })
        ).rejects.toMatchInlineSnapshot("[TRPCError: NOT_FOUND]");
    });

    it("throws when creating a todo for non-existing form", async () => {
        const caller = appRouter.createCaller(
            createInnerTRPCContextMockSession([UserRoleTitles.ASSIGNER])
        );
        vi.mocked(loadFormById).mockImplementationOnce(async () => null);
        expect(
            caller.task.createTask(mockInputTask)
        ).rejects.toMatchInlineSnapshot(
            "[TRPCError: Form with given formId does not exist]"
        );
    });

    it("throws when creating a todo for non-existing user", async () => {
        const caller = appRouter.createCaller(
            createInnerTRPCContextMockSession([UserRoleTitles.ASSIGNER])
        );
        vi.mocked(loadAssignees).mockImplementationOnce(async () => ({
            data: [],
            totalCount: 0,
        }));
        expect(
            caller.task.createTask(mockInputTask)
        ).rejects.toMatchInlineSnapshot(
            "[TRPCError: User with given forUserId does not exist]"
        );
    });
});

describe("todo permissions", () => {
    it("throws when deleting a todo as a client/patient", async () => {
        const clientCaller = appRouter.createCaller(
            createInnerTRPCContextMockSession([UserRoleTitles.ASSIGNEE])
        );
        await expect(
            clientCaller.task.deleteTask({
                id: faker.string.uuid(),
            })
        ).rejects.toMatchInlineSnapshot("[TRPCError: FORBIDDEN]");
    });

    it("throws when creating a todo as a client/patient", async () => {
        const clientCaller = appRouter.createCaller(
            createInnerTRPCContextMockSession([UserRoleTitles.ASSIGNEE])
        );
        await expect(
            clientCaller.task.createTask(mockInputTask)
        ).rejects.toMatchInlineSnapshot("[TRPCError: FORBIDDEN]");
    });

    it("throws when listing todos as unauthenticated", async () => {
        const caller = appRouter.createCaller(
            createInnerTRPCContextNoSession()
        );
        await expect(
            caller.task.listTasks({ pagination: { limit: 10, offset: 0 } })
        ).rejects.toMatchInlineSnapshot("[TRPCError: UNAUTHORIZED]");
    });

    it("throws when getting a todo as unauthenticated", async () => {
        const caller = appRouter.createCaller(
            createInnerTRPCContextNoSession()
        );
        await expect(
            caller.task.getTask({ id: "20" })
        ).rejects.toMatchInlineSnapshot("[TRPCError: UNAUTHORIZED]");
    });

    it("throws when getting todo not assigned to client/patient", async () => {
        const clientCtx = createInnerTRPCContextMockSession(
            [UserRoleTitles.ASSIGNEE],
            faker.string.uuid()
        );
        const clientCaller = appRouter.createCaller(clientCtx);

        const mockTaskForDifferentUser = {
            id: faker.string.uuid(),
            forUserId: faker.string.uuid(), // different user
            createdAt: faker.date.past(),
            updatedAt: faker.date.past(),
            createdByEmployeeId: faker.string.uuid(),
            state: TaskState.READY,
            submissionId: null,
            description: "",
            name: "",
            formId: faker.string.uuid(),
        };

        prisma.task.findUnique.mockResolvedValueOnce({
            start: null,
            ...mockTaskForDifferentUser,
        });
        await expect(() =>
            clientCaller.task.getTask({ id: mockTaskForDifferentUser.id })
        ).rejects.toMatchInlineSnapshot("[TRPCError: FORBIDDEN]");
    });
});

describe("todo when formio is down", () => {
    const throwFn = async () => {
        throw new Error("formio is down");
    };
    it("throws when creating a todo when loadForm fails", async () => {
        vi.mocked(loadFormById).mockImplementationOnce(throwFn);
        const caller = appRouter.createCaller(
            createInnerTRPCContextMockSession([UserRoleTitles.ASSIGNER])
        );
        await expect(
            caller.task.createTask(mockInputTask)
        ).rejects.toMatchInlineSnapshot(
            "[TRPCError: Checking of form existence failed]"
        );
    });

    it("throws when creating a todo when loadUsers fails", async () => {
        vi.mocked(loadAssignees).mockImplementationOnce(throwFn);
        const caller = appRouter.createCaller(
            createInnerTRPCContextMockSession([UserRoleTitles.ASSIGNER])
        );
        await expect(
            caller.task.createTask(mockInputTask)
        ).rejects.toMatchInlineSnapshot("[TRPCError: formio is down]");
    });
});
