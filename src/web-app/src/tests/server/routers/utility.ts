import { createInnerTRPCContext } from "@/server/trpc";
import { UserRoleTitle } from "@/types/userManagement/UserRoleTitle";

export function createInnerTRPCContextMockSession(
    roleTitles: UserRoleTitle[],
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
                metadata: {},
            },
            expires: "1",
        },
    });
}

export function createInnerTRPCContextNoSession() {
    return createInnerTRPCContext({
        session: null,
    });
}
