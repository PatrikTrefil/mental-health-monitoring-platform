import { POST as deleteConceptPost } from "@/app/api/ukol/smazat-koncept/route";
import { prisma } from "@/server/db";
import { expect, it, vi } from "vitest";

const formId = "form-id";
const userSubmissionId = "user-submission-id";
const userId = "user-id";
const taskId = "task-id";

const mockValidAdminToken = "valid admin token";

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
    await prisma.draft.create({
        data: {
            formId,
            userId: userSubmissionId,
            data: "{}",
        },
    });
    // act - call the tested function
    const response = await deleteConceptPost(
        new Request("http://mock-url.com", {
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
            where: { formId_userId: { formId, userId: userSubmissionId } },
        })
    ).resolves.toMatchInlineSnapshot("null");
});

it("returns 404 if the draft does not exist", async () => {
    const response = await deleteConceptPost(
        new Request("http://mock-url.com", {
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
