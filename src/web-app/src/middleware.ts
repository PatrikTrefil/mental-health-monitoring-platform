import { UserRoleTitles } from "@/types/users";
import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req: NextRequestWithAuth) {
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
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/uzivatel/:path*", "/zamestnanec/:path*"],
};
