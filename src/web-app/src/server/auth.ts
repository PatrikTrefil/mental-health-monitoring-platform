import {
    RequestError,
    fetchRoleList,
    loginAdmin,
    loginUser,
    refreshToken,
} from "@/client/formioClient";
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
