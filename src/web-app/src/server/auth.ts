import { RequestError } from "@/client/requestError";
import {
    loadRoles,
    loginAdmin,
    loginUser,
    refreshToken,
} from "@/client/userManagementClient";
import UserRoleTitles from "@/constants/userRoleTitles";
import { UserRoleTitle } from "@/types/userManagement/UserRoleTitle";
// Renaming to LocalUser because User is used by next-auth
import { User as LocalUser } from "@/types/userManagement/user";
import { type GetServerSidePropsContext } from "next";
import { AuthOptions, DefaultSession, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

// make auto-completion work for useSession
declare module "next-auth" {
    interface User extends LocalUser {
        roleTitles: UserRoleTitle[];
        formioToken: string;
        formioTokenExpiration: number;
    }
    interface Session {
        user: LocalUser &
            DefaultSession["user"] & {
                roleTitles: UserRoleTitle[];
                formioToken: string;
            };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        user?: LocalUser &
            DefaultSession["user"] & {
                roleTitles: UserRoleTitle[];
                formioToken: string;
                formioTokenExpiration: number;
            };
    }
}

/**
 * In miliseconds.
 */
const formioTokenExpirationTime = 5 * 60 * 1000; // 5 minutes (default in formio)

export const authOptions: AuthOptions = {
    // Configure one or more authentication providers
    providers: [
        CredentialsProvider({
            name: "Credentials",
            /**
             * Used to create a login page and used as a param of the authorize function.
             */
            credentials: {
                ID: { label: "ID", type: "text", placeholder: "1234" },
                password: { label: "Password", type: "password" },
            },
            /**
             * Called when initializing a session. The returned object will be passed to the jwt callback.
             * @param credentials - The credentials provided by the user.
             * @returns Null if the credentials are invalid, otherwise Promise<User>.
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

                    const roleList = await loadRoles(adminToken);

                    const roleTitles = user.roles.map((roleId) => {
                        const title = roleList.find(
                            (role) => role._id === roleId
                        )?.title;
                        return z.nativeEnum(UserRoleTitles).parse(title);
                    });

                    console.debug("Sending response...");
                    return {
                        id: user._id,
                        ...user,
                        formioToken,
                        roleTitles,
                        formioTokenExpiration:
                            Date.now() + formioTokenExpirationTime,
                    };
                } catch (e) {
                    console.error("Error: ", e); // log on server
                    if (e instanceof RequestError && e.status) {
                        const isInvalidCredentials =
                            e.status >= 400 && e.status < 500;
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
         * @param root0 - The token and the user object.
         * @param root0.token - The authentication token object.
         * @param root0.user - The user object, which is available only
         * in the first call of the session. (initial sign in).
         * @returns The token object.
         */
        async jwt({ token, user }) {
            const isInitialSignIn = !!user;
            if (isInitialSignIn) {
                token.user = user;
            } else {
                if (!token.user) throw new Error("No user in token");

                const needToRefreshToken =
                    Date.now() - token.user.formioTokenExpiration >
                    3 * 60 * 1000; // 3 minutes have passed

                if (needToRefreshToken) {
                    const newToken = await refreshToken(token.user.formioToken);
                    token.user.formioToken = newToken;
                }
            }

            return token;
        },
        /**
         * Creates the session object on the server, which is sent to the client.
         * @param root0 - The session and the token object.
         * @param root0.session - The session object.
         * @param root0.token - The token object.
         * @returns The session object passed to the client.
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
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 * @param ctx - Current context.
 * @param ctx.req - The request object.
 * @param ctx.res - The response object.
 * @returns The server session.
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
    req: GetServerSidePropsContext["req"];
    res: GetServerSidePropsContext["res"];
}) => {
    return getServerSession(ctx.req, ctx.res, authOptions);
};
