import { POST as deleteConceptPost } from "@/app/api/ukol/smazat-koncept/route";
import { prisma } from "@/server/__mocks__/db";
import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import { expect, it, vi } from "vitest";

vi.mock("@/server/db");

// make tests deterministic
faker.seed(123);

const formId = faker.string.uuid();
const userSubmissionId = faker.string.uuid();
const userId = faker.string.uuid();
const taskId = faker.string.uuid();

const mockValidAdminToken = faker.string.alpha(10);

vi.mock("@/client/userManagementClient", () => ({
    loginAdmin: vi.fn(() => mockValidAdminToken),
    loadClientsAndPatients: vi.fn(() => [
        {
            _id: userSubmissionId,
            data: {
                id: userId,
            },
        },
    ]),
}));

it("deletes a concept", async () => {
    // act - call the tested function
    const response = await deleteConceptPost(
        new Request(faker.internet.url(), {
            method: "POST",
            body: JSON.stringify({
                request: {
                    data: {
                        taskId,
                    },
                    owner: userSubmissionId,
                    form: formId,
                },
            }),
        })
    );
    // assert - the draft is deleted
    expect(response.status).toBe(200);
    expect(prisma.draft.delete).toHaveBeenCalledWith({
        where: {
            formId_userId: {
                formId,
                userId,
            },
        },
    });
});

it("returns 404 if the draft does not exist", async () => {
    prisma.draft.delete.mockImplementationOnce(() => {
        throw new Prisma.PrismaClientKnownRequestError("Not found", {
            code: "P2025",
            clientVersion: "",
        });
    });
    const response = await deleteConceptPost(
        new Request(faker.internet.url(), {
            method: "POST",
            body: JSON.stringify({
                request: {
                    data: {
                        taskId,
                    },
                    owner: userSubmissionId,
                    form: formId,
                },
            }),
        })
    );
    expect(response.status).toBe(404);
});
