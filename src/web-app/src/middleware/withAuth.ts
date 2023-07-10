import {
    fetchRoleList,
    getCurrentUser,
    loginAdmin,
} from "@/client/userManagementClient";
import { UserRoleTitle, UserRoleTitles } from "@/types/users";
import withAuthNextAuth, { NextRequestWithAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { MiddlewareWrapper } from "./types";

/**
 * Middleware for checking if user is authenticated.
 */
const withAuth: MiddlewareWrapper = (middlewareToWrap) => {
    return async (req, event) => {
        console.log("Authenticating in middleware...");
        if (req.nextUrl.pathname.startsWith("/api/")) {
            const errorResponse = await apiMiddleware(req);
            if (errorResponse) return errorResponse;
        } else {
            // this check is here only to handle TS error
            // this should never happen
            if (nextAuthMiddleware instanceof Promise)
                throw new Error("nextAuthMiddleware is a promise");
            // everything else is handled by next auth
            const errorResponse = await nextAuthMiddleware(req, event);
            if (errorResponse) return errorResponse;
        }
        return await middlewareToWrap(req, event);
    };
};
export default withAuth;

const nextAuthMiddleware = withAuthNextAuth(
    async function middleware(req) {
        return webpageMiddleware(req);
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

/**
 * Middleware for checking if user has sufficient privileges to access a webpage.
 * This is not used for API routes.
 */
function webpageMiddleware(req: NextRequestWithAuth) {
    if (
        req.nextauth?.token?.user &&
        !hasEnoughPrivilegesForWebpage(
            req.nextUrl.pathname,
            req.nextauth.token.user.roleTitles
        )
    ) {
        const url_403 = req.nextUrl.clone();
        url_403.pathname = "/403";
        url_403.searchParams.set("callbackUrl", req.nextUrl.toString());
        return NextResponse.rewrite(url_403);
    }
}

function hasEnoughPrivilegesForWebpage(
    webpagePathname: string,
    roleTitles: UserRoleTitle[]
) {
    if (webpagePathname.startsWith("/zamestnanec/"))
        return (
            roleTitles.includes(UserRoleTitles.SPRAVCE_DOTAZNIKU) ||
            roleTitles.includes(UserRoleTitles.ZADAVATEL_DOTAZNIKU)
        );

    if (webpagePathname.startsWith("/uzivatel/"))
        return roleTitles.includes(UserRoleTitles.KLIENT_PACIENT);
}

/**
 * Middleware for checking if user has sufficient privileges to access an API route.
 * This is not used for webpages.
 *
 * This middleware does not use next auth. It only expects the formio token to be in the header.
 */
async function apiMiddleware(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith("/api/ukol")) {
        const formioToken = req.headers.get("x-jwt-token");
        if (!formioToken)
            return new NextResponse(
                "Missing formio token in header x-jwt-token",
                {
                    status: 401,
                }
            );

        let user: Awaited<ReturnType<typeof getCurrentUser>> | undefined;
        try {
            user = await getCurrentUser(formioToken);
        } catch (e) {
            console.log(e);
            return new NextResponse("Unauthorized", { status: 401 });
        }

        let roleList: Awaited<ReturnType<typeof fetchRoleList>> | undefined;
        try {
            const adminToken = await loginAdmin(
                process.env.FORMIO_ROOT_EMAIL,
                process.env.FORMIO_ROOT_PASSWORD
            );
            roleList = await fetchRoleList(adminToken);
        } catch {
            return new NextResponse("Internal server error", { status: 500 });
        }

        const clientPatientRoleId = roleList.find(
            (r) => r.title === UserRoleTitles.KLIENT_PACIENT
        )?._id;

        if (!clientPatientRoleId)
            return new NextResponse("Internal server error", { status: 500 });

        if (!user.roles.includes(clientPatientRoleId))
            return new NextResponse("Unauthorized", { status: 401 });
    }
}
