import { AppRouter, appRouter } from "@/server/routers/root";
import { UserRoleTitles } from "@/types/users";
import { inferProcedureInput } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { createInnerTRPCContextMockSession } from "./utility";

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
    const formId = "some-form-id";

    it("throws when getting a non-existing draft", async () => {
        expect(caller.draft.getDraft({ formId })).rejects.toMatchSnapshot();
    });

    it("throws when deleting a non-existing draft", async () => {
        expect(caller.draft.deleteDraft({ formId })).rejects.toMatchSnapshot();
    });

    it("should throw when passing a non-stringifiable JSON value", async () => {
        expect(
            caller.draft.upsertDraft({
                formId,
                data: {
                    a: BigInt(10),
                },
            })
        ).rejects.toMatchSnapshot();
    });

    it("should be possible to create a draft", async () => {
        type CreateDraftInput = inferProcedureInput<
            AppRouter["draft"]["upsertDraft"]
        >;
        const input: CreateDraftInput = {
            formId,
            data: {},
        };
        const result = await caller.draft.upsertDraft(input);
        expect(result).toMatchSnapshot();
    });

    it("should be possible to edit my draft", async () => {
        type UpdateDraftInput = inferProcedureInput<
            AppRouter["draft"]["upsertDraft"]
        >;
        const input: UpdateDraftInput = {
            formId,
            data: { new: "data" },
        };
        const result = await caller.draft.upsertDraft(input);
        expect(result).toMatchSnapshot();
    });

    it("should be possible to delete a draft ", async () => {
        await caller.draft.deleteDraft({ formId });
    });
});
