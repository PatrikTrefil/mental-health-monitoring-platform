import { loadFormById } from "@/client/formManagementClient";
import { loadUsers } from "@/client/userManagementClient";
import TaskState from "@/constants/taskState";
import UserRoleTitles from "@/constants/userRoleTitles";
import { appRouter, type AppRouter } from "@/server/routers/root";
import { type inferProcedureInput } from "@trpc/server";
import { describe, expect, it, vi } from "vitest";
import {
    createInnerTRPCContextMockSession,
    createInnerTRPCContextNoSession,
} from "./utility";

type CreateTaskInput = inferProcedureInput<AppRouter["task"]["createTask"]>;
const mockInputTask: CreateTaskInput & { description: string } = {
    name: "test",
    forUserId: "123",
    description: "test",
    formId: "123",
};

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
        const caller = appRouter.createCaller(
            createInnerTRPCContextMockSession([
                UserRoleTitles.ZADAVATEL_DOTAZNIKU,
            ])
        );

        vi.mocked(loadFormById).mockResolvedValueOnce({
            _id: mockInputTask.formId,
            title: "",
            created: "",
            name: "name",
            path: "/path",
            submissionAccess: [],
            components: [],
        });
        const createdTask = await caller.task.createTask(mockInputTask);

        expect(createdTask).toMatchObject({
            ...mockInputTask,
            id: expect.any(String),
        });
    });

    it("get existing todo as patient", async () => {
        const employeeCtx = createInnerTRPCContextMockSession([
            UserRoleTitles.ZADAVATEL_DOTAZNIKU,
        ]);
        const employeeCaller = appRouter.createCaller(employeeCtx);

        const createdTask = await employeeCaller.task.createTask(mockInputTask);

        const clientCtx = createInnerTRPCContextMockSession([
            UserRoleTitles.KLIENT_PACIENT,
        ]);
        const clientCaller = appRouter.createCaller(clientCtx);

        const receivedTask = await clientCaller.task.getTask({
            id: createdTask.id,
        });

        expect(receivedTask).toMatchObject({
            ...mockInputTask,
            id: expect.any(String),
        });
    });

    it("throws when getting non-existing todo as employee", async () => {
        const caller = appRouter.createCaller(
            createInnerTRPCContextMockSession([
                UserRoleTitles.ZADAVATEL_DOTAZNIKU,
            ])
        );
        const todoId = "123";
        // delete if already exists
        try {
            await caller.task.deleteTask({ id: todoId });
        } catch (e) {}

        expect(() =>
            caller.task.getTask({ id: todoId })
        ).rejects.toThrowError();
    });

    it("list of all todos contains created todos as employee", async () => {
        const ctx = createInnerTRPCContextMockSession([
            UserRoleTitles.ZADAVATEL_DOTAZNIKU,
        ]);
        const caller = appRouter.createCaller(ctx);

        const numberOfTasks = 10;
        // create tasks to list
        for (let i = 0; i < numberOfTasks; i++) {
            await caller.task.createTask({
                ...mockInputTask,
                name: `test ${i}`,
            });
        }

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
        const patientId = "12345";
        const createdTasks = [];
        // create tasks for patient
        {
            const employeeCtx = createInnerTRPCContextMockSession([
                UserRoleTitles.ZADAVATEL_DOTAZNIKU,
            ]);
            const employeeCaller = appRouter.createCaller(employeeCtx);

            // create tasks to list
            for (let i = 0; i < numberOfTasks; i++) {
                vi.mocked(loadUsers).mockImplementationOnce(async () => {
                    const mockUsers = [
                        {
                            _id: "12345",
                            data: { id: patientId },
                            created: "",
                            owner: "",
                            access: [],
                            form: "",
                            roles: [],
                            metadata: {},
                        },
                    ];
                    return mockUsers;
                });
                createdTasks.push(
                    await employeeCaller.task.createTask({
                        ...mockInputTask,
                        name: `test ${i}`,
                        forUserId: patientId,
                    })
                );
            }
        }
        // check that all tasks that were created are listed
        {
            const patientCtx = createInnerTRPCContextMockSession(
                [UserRoleTitles.KLIENT_PACIENT],
                patientId
            );
            const patientCaller = appRouter.createCaller(patientCtx);
            const patientsTasks = await patientCaller.task.listTasks();

            // check that all tasks are present in the returned list
            for (let i = 0; i < numberOfTasks; i++) {
                expect(patientsTasks).toContainEqual(createdTasks[i]);
            }
        }
    });

    it("deletes an existing todo as employee", async () => {
        const caller = appRouter.createCaller(
            createInnerTRPCContextMockSession([
                UserRoleTitles.ZADAVATEL_DOTAZNIKU,
            ])
        );

        const createdTask = await caller.task.createTask(mockInputTask);

        await caller.task.deleteTask({
            id: createdTask.id,
        });

        expect(
            caller.task.getTask({ id: createdTask.id })
        ).rejects.toMatchInlineSnapshot("[TRPCError: NOT_FOUND]");
    });

    it("throws not found when deleting a non-existing todo as employee", async () => {
        const caller = appRouter.createCaller(
            createInnerTRPCContextMockSession([
                UserRoleTitles.ZADAVATEL_DOTAZNIKU,
            ])
        );

        // delete if already exists
        try {
            await caller.task.deleteTask({
                id: "20",
            });
        } catch (e) {}

        await expect(
            caller.task.deleteTask({
                id: "20",
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
        const employeeCaller = appRouter.createCaller(
            createInnerTRPCContextMockSession([
                UserRoleTitles.ZADAVATEL_DOTAZNIKU,
            ])
        );
        const createdTask = await employeeCaller.task.createTask(mockInputTask);
        const clientCaller = appRouter.createCaller(
            createInnerTRPCContextMockSession([UserRoleTitles.KLIENT_PACIENT])
        );
        await expect(
            clientCaller.task.deleteTask({
                id: createdTask.id,
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
        const employeeCaller = appRouter.createCaller(
            createInnerTRPCContextMockSession([
                UserRoleTitles.ZADAVATEL_DOTAZNIKU,
            ])
        );
        vi.mocked(loadUsers).mockImplementationOnce(async () => {
            const mockUsers = [
                {
                    _id: "12345",
                    data: { id: "12345" },
                    created: "",
                    owner: "",
                    access: [],
                    form: "",
                    roles: [],
                    metadata: {},
                },
            ];
            return mockUsers;
        });
        const createdTask = await employeeCaller.task.createTask({
            ...mockInputTask,
            forUserId: "12345",
        });
        const clientCaller = appRouter.createCaller(
            createInnerTRPCContextMockSession(
                [UserRoleTitles.KLIENT_PACIENT],
                "123"
            )
        );
        await expect(() =>
            clientCaller.task.getTask({ id: createdTask.id })
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
