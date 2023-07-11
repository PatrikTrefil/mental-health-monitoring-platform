import UserRoleTitles from "@/constants/userRoleTitles";
import { prisma } from "@/server/__mocks__/db";
import { AppRouter, appRouter } from "@/server/routers/root";
import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import { inferProcedureInput } from "@trpc/server";
import { describe, expect, it, vi } from "vitest";
import { createInnerTRPCContextMockSession } from "./utility";

// make tests deterministic
faker.seed(123);

vi.mock("@/server/db");

describe.each(
    Object.values(UserRoleTitles).filter(
        (r) => r !== UserRoleTitles.KLIENT_PACIENT
    )
)("as $1 it", (role) => {
    const ctx = createInnerTRPCContextMockSession([role]);
    const caller = appRouter.createCaller(ctx);

    it("should not be possible to create a draft", async () => {
        type CreateDraftInput = inferProcedureInput<
            AppRouter["draft"]["upsertDraft"]
        >;
        const input: CreateDraftInput = {
            formId: "some-form-id",
            data: {},
        };
        expect(
            async () => await caller.draft.upsertDraft(input)
        ).rejects.toMatchSnapshot();
    });

    it("should not be possible to get a draft", async () => {
        expect(
            async () => await caller.draft.getDraft({ formId: "some-form-id" })
        ).rejects.toMatchSnapshot();
    });

    it("should not be possible to update a draft", async () => {
        expect(
            async () =>
                await caller.draft.upsertDraft({
                    formId: "some-form-id",
                    data: {},
                })
        ).rejects.toMatchSnapshot();
    });
});

describe(`as a ${UserRoleTitles.KLIENT_PACIENT} it`, () => {
    const ctx = createInnerTRPCContextMockSession([
        UserRoleTitles.KLIENT_PACIENT,
    ]);
    const caller = appRouter.createCaller(ctx);
    const nonexistentFormId = "nonexistent-form-id";

    it("throws when getting a non-existing draft", async () => {
        prisma.draft.findUnique.mockResolvedValue(null);
        expect(
            caller.draft.getDraft({ formId: nonexistentFormId })
        ).rejects.toMatchSnapshot();
    });

    it("throws when deleting a non-existing draft", async () => {
        prisma.draft.delete.mockImplementationOnce(() => {
            throw new Prisma.PrismaClientKnownRequestError("not found", {
                code: "P2025",
                clientVersion: "",
            });
        });
        expect(
            caller.draft.deleteDraft({ formId: nonexistentFormId })
        ).rejects.toMatchSnapshot();
    });

    it("should throw when passing a non-stringifiable JSON value", async () => {
        expect(
            caller.draft.upsertDraft({
                formId: nonexistentFormId,
                data: {
                    a: BigInt(10),
                },
            })
        ).rejects.toMatchSnapshot();
    });

    const formId = faker.string.alpha(10);

    it("should be possible to create a draft", async () => {
        type CreateDraftInput = inferProcedureInput<
            AppRouter["draft"]["upsertDraft"]
        >;
        const input: CreateDraftInput = {
            formId,
            data: {},
        };
        if (!ctx.session) throw new Error("no session");

        prisma.draft.upsert.mockResolvedValueOnce({
            formId,
            userId: ctx.session.user.data.id,
            data: JSON.stringify(input.data),
        });
        const result = await caller.draft.upsertDraft(input);
        expect(result).toMatchSnapshot();
    });

    it("should be possible to edit my draft", async () => {
        type UpdateDraftInput = inferProcedureInput<
            AppRouter["draft"]["upsertDraft"]
        >;
        const input: UpdateDraftInput = {
            formId: formId,
            data: { new: "data" },
        };
        if (!ctx.session) throw new Error("no session");
        prisma.draft.upsert.mockResolvedValueOnce({
            formId,
            data: JSON.stringify(input.data),
            userId: ctx.session.user.data.id,
        });
        const result = await caller.draft.upsertDraft(input);
        expect(result).toMatchSnapshot();
    });

    it("should be possible to delete a draft ", async () => {
        if (!ctx.session) throw new Error("no session");
        prisma.draft.delete.mockResolvedValueOnce({
            formId,
            userId: ctx.session.user.data.id,
            data: "",
        });
        await caller.draft.deleteDraft({ formId });
    });
});
