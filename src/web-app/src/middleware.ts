import { UserRoleTitles } from "@/types/users";
import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import {
    fetchRoleList,
    getCurrentUser,
    loginAdmin,
} from "./client/formioClient";

export async function middleware(
    req: NextRequestWithAuth,
    event: NextFetchEvent
) {
    if (req.nextUrl.pathname.startsWith("/api/"))
        return await apiMiddleware(req);
    else {
        // this check is here only to handle TS error
        // this should never happen
        if (nextAuthMiddleware instanceof Promise)
            throw new Error("nextAuthMiddleware is a promise");
        // everything else is handled by next auth
        nextAuthMiddleware(req, event);
    }
}

export const config = {
    matcher: ["/uzivatel/:path*", "/zamestnanec/:path*", "/api/:path*"],
};

const nextAuthMiddleware = withAuth(
    async function middleware(req: NextRequestWithAuth) {
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
    // if accessing /zamestnanec/*, check if user has role ZAMESTNANEC
    // if accessing /uzivatel/*, check if user has role KLIENT_PACIENT
    const hasSufficientPrivileges =
        (req.nextUrl.pathname.startsWith("/zamestnanec/") &&
            req.nextauth.token?.user?.roleTitles.includes(
                UserRoleTitles.ZAMESTNANEC
            )) ||
        (req.nextUrl.pathname.startsWith("/uzivatel/") &&
            req.nextauth.token?.user?.roleTitles.includes(
                UserRoleTitles.KLIENT_PACIENT
            ));

    if (!hasSufficientPrivileges) {
        const url_403 = req.nextUrl.clone();
        url_403.pathname = "/403";
        url_403.searchParams.set("callbackUrl", req.nextUrl.toString());
        return NextResponse.rewrite(url_403);
    }
}

/**
 * Middleware for checking if user has sufficient privileges to access an API route.
 * This is not used for webpages.
 *
 * This middleware does not use next auth. It only expects the formio token to be in the header.
 */
async function apiMiddleware(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith("/api/ukol")) {
        console.log("ahldf");
        const formioToken = req.headers.get("x-jwt-token");
        if (!formioToken)
            return new NextResponse(
                "Missing formio token in header x-jwt-token",
                {
                    status: 401,
                }
            );
        const user = await getCurrentUser(formioToken);
        const adminToken = await loginAdmin(
            process.env.FORMIO_ROOT_EMAIL,
            process.env.FORMIO_ROOT_PASSWORD
        );
        const roleList = await fetchRoleList(adminToken);
        const clientPatientRoleId = roleList.find(
            (r) => r.title === UserRoleTitles.KLIENT_PACIENT
        )?._id;
        if (!clientPatientRoleId)
            return new NextResponse("Something went wrong", { status: 500 });

        if (!user.roles.includes(clientPatientRoleId)) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
    }
}
