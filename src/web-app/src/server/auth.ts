import { UserFormSubmission } from "@/types/userFormSubmission";
import { type GetServerSidePropsContext } from "next";
import { AuthOptions, DefaultSession, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// make auto-completion work for useSession
declare module "next-auth" {
    interface User extends UserFormSubmission {
        roleTitles: string[];
        formioToken: string;
    }
    interface Session {
        user: UserFormSubmission &
            DefaultSession["user"] & {
                roleTitles: string[];
                formioToken: string;
            };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        user?: UserFormSubmission &
            DefaultSession["user"] & {
                roleTitles: string[];
                formioToken: string;
            };
    }
}

export const authOptions: AuthOptions = {
    // Configure one or more authentication providers
    providers: [
        CredentialsProvider({
            name: "Credentials",
            /**
             * Used to create a login page and used as a param of the authorize function
             */
            credentials: {
                ID: { label: "ID", type: "text", placeholder: "1234" },
                password: { label: "Password", type: "password" },
            },
            /**
             * Called when initializing a session. The returned object will be passed to the jwt callback.
             * @returns Promise<null> if the credentials are invalid, otherwise Promise<User>
             */
            async authorize(credentials) {
                if (!credentials) return null; // invalid credentials because they were not provided

                try {
                    const { user, formioToken } = await loginUser(
                        credentials.ID,
                        credentials.password
                    );

                    const adminToken = await loginAdmin(
                        process.env.FORMIO_ROOT_EMAIL,
                        process.env.FORMIO_ROOT_PASSWORD
                    );

                    const roleList = await fetchRoleList(adminToken);

                    const roleTitles = user.roles.map((roleId) => {
                        const title = roleList.find(
                            (role) => role._id === roleId
                        )?.title;
                        if (!title) throw new Error(`Role ${roleId} not found`);
                        return title;
                    });

                    console.debug("Sending response...");
                    return {
                        id: user._id,
                        ...user,
                        formioToken,
                        roleTitles,
                    };
                } catch (e) {
                    console.error("Error: ", e); // log on server
                    if (e instanceof RequestError) {
                        const isInvalidCredentials =
                            e.statusCode >= 400 && e.statusCode < 500;
                        if (isInvalidCredentials) return null;
                    }
                    throw new Error("Unexpected error on server"); // Send generic error to client
                }
            },
        }),
    ],
    jwt: {
        maxAge: 230, // this must be lower that the validity of the formio token
    },
    callbacks: {
        /**
         * Creates the JWT token on the server.
         */
        async jwt({ token, user }) {
            // the user is available only in the first call
            // initial sign in
            if (user) {
                token.user = user;
            } else {
                if (!token.user) throw new Error("No user in token");
                // update the formio token (may throw)
                const newToken = await refreshToken(token.user.formioToken);
                token.user.formioToken = newToken;
            }

            return token;
        },
        /**
         * Creates the session object on the server, which is sent to the client.
         */
        async session({ session, token }) {
            // make user information available in the session (used in client)
            if (token.user) session.user = token.user;

            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    debug:
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "test",
};

/**
 * Error thrown when a fetch request fails.
 */
class RequestError extends Error {
    /**
     * Status code of the failed request.
     */
    statusCode: number;
    constructor(status: number) {
        super();
        this.statusCode = status;
    }
}

/**
 * Log in as a user
 * @param id id of the user
 * @param password password of the user
 * @returns user and JWT token
 * @throws RequestError if the request's status is not ok
 * @throws TypeError if the request completely fails
 */
async function loginUser(id: string, password: string) {
    console.log("Making login request...");
    const loginResponse = await fetch(
        `${process.env.FORMIO_SERVER_URL}/login`,
        {
            body: JSON.stringify({
                data: {
                    id,
                    password,
                },
            }),
            headers: {
                "Content-type": "application/json; charset=utf-8",
            },
            method: "POST",
        }
    );
    console.log("Login request done.", {
        status: loginResponse.status,
    });

    if (!loginResponse.ok) throw new RequestError(loginResponse.status);

    const user = (await loginResponse.json()) as UserFormSubmission;
    const formioToken = loginResponse.headers.get("x-jwt-token");
    if (!formioToken) throw new Error("No token received");

    return { user, formioToken };
}

/**
 * Logs in the admin account and returns the token.
 * @param email email of the admin account
 * @param password password of the admin account
 * @returns JWT token with admin privileges
 * @throws RequestError if the request's status is not ok
 * @throws TypeError if the request completely fails
 */
async function loginAdmin(email: string, password: string) {
    console.log("Making admin login request...");
    const adminLoginResponse = await fetch(
        `${process.env.FORMIO_SERVER_URL}/user/login`,
        {
            body: JSON.stringify({
                data: {
                    email,
                    password,
                },
            }),
            headers: {
                "Content-type": "application/json; charset=utf-8",
            },
            method: "POST",
        }
    );
    console.log("Admin login request done.", {
        status: adminLoginResponse.status,
    });

    if (!adminLoginResponse.ok)
        throw new RequestError(adminLoginResponse.status);

    const adminToken = adminLoginResponse.headers.get("x-jwt-token");

    if (!adminToken) throw new Error("No token received");

    return adminToken;
}

/**
 * Fetches the list of roles from the server.
 * @param adminToken JWT token with admin privileges
 * @returns list of roles
 * @throws RequestError if the request's status is not ok
 * @throws TypeError if the request completely fails
 */
async function fetchRoleList(adminToken: string) {
    console.log("Fetching role list...");
    const roleListResponse = await fetch(
        `${process.env.FORMIO_SERVER_URL}/role`,
        {
            headers: {
                "x-jwt-token": adminToken,
            },
        }
    );
    console.log("Role list fetched.", {
        status: roleListResponse.status,
    });
    if (!roleListResponse.ok) throw new RequestError(roleListResponse.status);

    const roleList = (await roleListResponse.json()) as {
        _id: string;
        title: string;
    }[];

    return roleList;
}

/**
 * Refreshes the token of a user.
 * @param currentToken current JWT token of the user
 * @throws RequestError if the request's status is not ok
 * @throws TypeError if the request completely fails
 */
async function refreshToken(currentToken: string) {
    console.log("Refreshing token...");
    const refreshResponse = await fetch(
        `${process.env.FORMIO_SERVER_URL}/current`,
        {
            headers: {
                "x-jwt-token": currentToken,
            },
        }
    );
    if (!refreshResponse.ok) throw new RequestError(refreshResponse.status);
    const newToken = refreshResponse.headers.get("x-jwt-token");
    if (!newToken) throw new Error("No token received");
    console.log("Token refreshed.");
    return newToken;
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
    req: GetServerSidePropsContext["req"];
    res: GetServerSidePropsContext["res"];
}) => {
    return getServerSession(ctx.req, ctx.res, authOptions);
};
