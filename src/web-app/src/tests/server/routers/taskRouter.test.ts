import { loadFormById } from "@/client/formManagementClient";
import { loadUsers } from "@/client/userManagementClient";
import TaskState from "@/constants/taskState";
import UserRoleTitles from "@/constants/userRoleTitles";
import { prisma } from "@/server/__mocks__/db";
import { appRouter, type AppRouter } from "@/server/routers/root";
import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import { inferProcedureOutput, type inferProcedureInput } from "@trpc/server";
import { describe, expect, it, vi } from "vitest";
import {
    createInnerTRPCContextMockSession,
    createInnerTRPCContextNoSession,
} from "./utility";

type CreateTaskInput = inferProcedureInput<AppRouter["task"]["createTask"]>;
const mockInputTask: CreateTaskInput & { description: string } = {
    name: "foo",
    forUserId: faker.string.uuid(),
    description: "bar",
    formId: faker.string.uuid(),
};
const mockOutputTaskExpectationTemplate = {
    ...mockInputTask,
    id: expect.any(String),
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
    createdByEmployeeId: expect.any(String),
    state: TaskState.READY,
    submissionId: null,
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
    loadUsers: vi.fn(async () => {
        const mockUsers: Awaited<ReturnType<typeof loadUsers>> = [
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
        ];
        return mockUsers;
    }),
}));

describe("todo functionality", () => {
    it("returns created todo as employee", async () => {
        const employeeCtx = createInnerTRPCContextMockSession([
            UserRoleTitles.ZADAVATEL_DOTAZNIKU,
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
        vi.mocked(loadUsers).mockResolvedValueOnce([
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
        ]);
        if (!employeeCtx.session) throw new Error("no session");

        prisma.task.create.mockResolvedValueOnce(
            mockOutputTaskExpectationTemplate
        );
        const createdTask = await caller.task.createTask(mockInputTask);

        expect(createdTask).toMatchObject(mockOutputTaskExpectationTemplate);
    });

    it("get existing todo as patient", async () => {
        // arrange
        const clientCtx = createInnerTRPCContextMockSession(
            [UserRoleTitles.KLIENT_PACIENT],
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
        });
        const receivedTask = await clientCaller.task.getTask({
            id: mockTaskId,
        });

        // assert
        expect(receivedTask).toMatchObject(mockOutputTaskExpectationTemplate);
    });

    it("throws when getting non-existing todo as employee", async () => {
        const caller = appRouter.createCaller(
            createInnerTRPCContextMockSession([
                UserRoleTitles.ZADAVATEL_DOTAZNIKU,
            ])
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
            UserRoleTitles.ZADAVATEL_DOTAZNIKU,
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

        prisma.task.findMany.mockResolvedValueOnce(mockTasks);
        const tasks = await caller.task.listTasks();

        if (!ctx.session?.user.data.id) throw new Error("Session is null");

        // check that all tasks are present in the returned list
        for (let i = 0; i < numberOfTasks; i++) {
            const expectedTask: Awaited<
                ReturnType<typeof caller.task.listTasks>
            >[number] = {
                ...mockInputTask,
                name: `test ${i}`,
                id: expect.any(String),
                updatedAt: expect.any(Date),
                createdByEmployeeId: ctx.session.user.data.id,
                createdAt: expect.any(Date),
                state: TaskState.READY,
                submissionId: null,
            };
            expect(tasks).toContainEqual(expectedTask);
        }
    });

    it("lists my todos as client/patient", async () => {
        const numberOfTasks = 10;
        const patientId = faker.string.uuid();
        const createdTasks: inferProcedureOutput<
            AppRouter["task"]["listTasks"]
        > = new Array(numberOfTasks);
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
            };
        }
        // check that all tasks that were created are listed
        const patientCtx = createInnerTRPCContextMockSession(
            [UserRoleTitles.KLIENT_PACIENT],
            patientId
        );
        const patientCaller = appRouter.createCaller(patientCtx);
        prisma.task.findMany.mockResolvedValueOnce(createdTasks);
        const patientsTasks = await patientCaller.task.listTasks();

        // assert
        for (const createdTask of createdTasks) {
            if (createdTask.forUserId === patientId)
                expect(patientsTasks).toContainEqual(createdTask);
        }
    });

    it("throws not found when deleting a non-existing todo as employee", async () => {
        const caller = appRouter.createCaller(
            createInnerTRPCContextMockSession([
                UserRoleTitles.ZADAVATEL_DOTAZNIKU,
            ])
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
            createInnerTRPCContextMockSession([
                UserRoleTitles.ZADAVATEL_DOTAZNIKU,
            ])
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
            createInnerTRPCContextMockSession([
                UserRoleTitles.ZADAVATEL_DOTAZNIKU,
            ])
        );
        vi.mocked(loadUsers).mockImplementationOnce(async () => []);
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
            createInnerTRPCContextMockSession([UserRoleTitles.KLIENT_PACIENT])
        );
        await expect(
            clientCaller.task.deleteTask({
                id: faker.string.uuid(),
            })
        ).rejects.toMatchInlineSnapshot("[TRPCError: FORBIDDEN]");
    });

    it("throws when creating a todo as a client/patient", async () => {
        const clientCaller = appRouter.createCaller(
            createInnerTRPCContextMockSession([UserRoleTitles.KLIENT_PACIENT])
        );
        await expect(
            clientCaller.task.createTask(mockInputTask)
        ).rejects.toMatchInlineSnapshot("[TRPCError: FORBIDDEN]");
    });

    it("throws when listing todos as unauthenticated", async () => {
        const caller = appRouter.createCaller(
            createInnerTRPCContextNoSession()
        );
        await expect(caller.task.listTasks()).rejects.toMatchInlineSnapshot(
            "[TRPCError: UNAUTHORIZED]"
        );
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
            [UserRoleTitles.KLIENT_PACIENT],
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

        prisma.task.findUnique.mockResolvedValueOnce(mockTaskForDifferentUser);
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
            createInnerTRPCContextMockSession([
                UserRoleTitles.ZADAVATEL_DOTAZNIKU,
            ])
        );
        await expect(
            caller.task.createTask(mockInputTask)
        ).rejects.toMatchInlineSnapshot(
            "[TRPCError: Checking of form existence failed]"
        );
    });

    it("throws when creating a todo when loadUsers fails", async () => {
        vi.mocked(loadUsers).mockImplementationOnce(throwFn);
        const caller = appRouter.createCaller(
            createInnerTRPCContextMockSession([
                UserRoleTitles.ZADAVATEL_DOTAZNIKU,
            ])
        );
        await expect(
            caller.task.createTask(mockInputTask)
        ).rejects.toMatchInlineSnapshot("[TRPCError: formio is down]");
    });
});
