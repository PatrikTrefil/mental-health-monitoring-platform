import { POST as deleteConceptPost } from "@/app/api/ukol/smazat-koncept/route";
import { prisma } from "@/server/db";
import { faker } from "@faker-js/faker";
import { expect, it, vi } from "vitest";

// make tests deterministic
faker.seed(123);

const formId = faker.string.uuid();
const userSubmissionId = faker.string.uuid();
const userId = faker.string.uuid();
const taskId = faker.string.uuid();

const mockValidAdminToken = faker.string.alpha(10);

vi.mock("@/client/formioClient", () => ({
    loginAdmin: vi.fn(() => mockValidAdminToken),
    loadUsers: vi.fn(() => [
        {
            _id: userSubmissionId,
            data: {
                id: userId,
            },
        },
    ]),
}));

it("deletes a concept", async () => {
    // create the draft to delete in DB
    await prisma.draft.upsert({
        where: {
            formId_userId: {
                formId,
                userId: userId,
            },
        },
        create: {
            data: "{}",
            formId,
            userId: userId,
        },
        update: {},
    });
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
    expect(
        prisma.draft.findUnique({
            where: { formId_userId: { formId, userId } },
        })
    ).resolves.toMatchInlineSnapshot("null");
});

it("returns 404 if the draft does not exist", async () => {
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
