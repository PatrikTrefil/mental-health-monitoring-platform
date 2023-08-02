import { createInnerTRPCContext } from "@/server/trpc";
import { UserRoleTitle } from "@/types/userManagement/UserRoleTitle";

/**
 * Create a mock context with an existing session for testing purposes.
 * @param roleTitles - Roles of the owner of the session.
 * @param userId - Id of the owner of the session.
 * @returns A context with a mock session.
 */
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

/**
 * Create a mock context with no session for testing purposes.
 * @returns A context with no session.
 */
export function createInnerTRPCContextNoSession() {
    return createInnerTRPCContext({
        session: null,
    });
}
