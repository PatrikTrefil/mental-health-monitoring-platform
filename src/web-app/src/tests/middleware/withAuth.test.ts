import {
    fetchRoleList,
    getCurrentUser,
    loginAdmin,
} from "@/client/formioClient";
import { stackMiddlewares } from "@/middleware/stackMiddleware";
import withAuth from "@/middleware/withAuth";
import { UserRoleTitle, UserRoleTitles } from "@/types/users";
import { NextRequestWithAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const authMiddleware = stackMiddlewares([withAuth]);

const mockInvalidUserToken = "invalid user token;";
const mockValidUserToken = "valid user token";
const mockValidAdminToken = "valid admin token";

const mockUserRoleId = "123";

vi.mock("@/client/formioClient", () => ({
    getCurrentUser: vi.fn(async (token: string) => {
        if (token === mockInvalidUserToken) throw new TypeError();
        else if (token === mockValidUserToken) {
            const mockUser: Awaited<ReturnType<typeof getCurrentUser>> = {
                _id: "12324",
                data: { id: "123" },
                created: "",
                owner: "",
                access: [],
                form: "",
                roles: [mockUserRoleId],
                externalIds: [],
                modified: "",
            };
            return mockUser;
        }
        throw new Error("Unexpected token");
    }),
    fetchRoleList: vi.fn(),
    loginAdmin: vi.fn(),
}));

const mockNextFetchEvent = {} as any; // There is a problem with standard instantiation of NextFetchEvent

type TestInput = {
    roleTitleToTest: UserRoleTitle;
    pathToTest: string;
};

describe.each<TestInput>([
    {
        roleTitleToTest: UserRoleTitles.KLIENT_PACIENT,
        pathToTest: "http://localhost/uzivatel/prehled",
    },
    {
        roleTitleToTest: UserRoleTitles.SPRAVCE_DOTAZNIKU,
        pathToTest: "http://localhost/zamestnanec/prehled",
    },
    {
        roleTitleToTest: UserRoleTitles.ZADAVATEL_DOTAZNIKU,
        pathToTest: "http://localhost/zamestnanec/prehled",
    },
])(
    "accessing $roleTitleToTest page",
    ({ roleTitleToTest, pathToTest }: TestInput) => {
        it("should not be possible if no token is provided", async () => {
            const req = new NextRequest(pathToTest) as NextRequestWithAuth;
            // will make it into a valid instance on the next line
            req.nextauth = { token: null };

            const response = await authMiddleware(req, mockNextFetchEvent);
            expect(response?.status).toMatchSnapshot();
        });
        it(`should not be possible if the user is not an ${roleTitleToTest}`, async () => {
            const req = new NextRequest(pathToTest) as NextRequestWithAuth;
            // will make it into a valid instance on the next line
            req.nextauth = {
                token: {
                    user: {
                        roleTitles: [],
                        _id: "123",
                        email: "",
                        created: "",
                        access: [],
                        data: { id: "" },
                        form: "",
                        formioToken: "",
                        metadata: {},
                        owner: "",
                        roles: ["foo"],
                        formioTokenExpiration: 10,
                    },
                },
            };
            const response = await authMiddleware(req, mockNextFetchEvent);
            expect(response?.status).toMatchSnapshot();
        });
        it(`should be possible if the user is an ${roleTitleToTest}`, async () => {
            const req = new NextRequest(pathToTest) as NextRequestWithAuth; // will make it into a valid instance on the next line
            req.nextauth = {
                token: {
                    user: {
                        roleTitles: [roleTitleToTest],
                        _id: "123",
                        email: "",
                        created: "",
                        access: [],
                        data: { id: "" },
                        form: "",
                        formioToken: "",
                        metadata: {},
                        owner: "",
                        roles: ["kdjf"],
                        formioTokenExpiration: 10,
                    },
                },
            };
            const response = await authMiddleware(req, mockNextFetchEvent);
            expect(response?.status).toMatchSnapshot();
        });
    }
);

describe("accessing /api/ukol/*", () => {
    it("should not be possible if no token is provided", async () => {
        const req = new NextRequest(
            "http://localhost/api/ukol/"
        ) as NextRequestWithAuth;
        req.nextauth = { token: null };
        const response = await authMiddleware(req, mockNextFetchEvent);
        expect(response?.status).toMatchInlineSnapshot("401");
    });

    it("should not be possible with invalid token provided", async () => {
        const req = new NextRequest(
            "http://localhost/api/ukol/"
        ) as NextRequestWithAuth;
        req.nextauth = { token: null };
        req.headers.set("x-jwt-token", mockInvalidUserToken);
        const response = await authMiddleware(req, mockNextFetchEvent);
        expect(response?.status).toMatchInlineSnapshot("401");
    });

    it("should be possible with valid user token provided", async () => {
        const req = new NextRequest(
            "http://localhost/api/ukol/"
        ) as NextRequestWithAuth;
        req.nextauth = { token: null };
        req.headers.set("x-jwt-token", mockValidUserToken);

        vi.mocked(loginAdmin).mockImplementationOnce(
            async () => mockValidAdminToken
        );

        vi.mocked(fetchRoleList).mockImplementationOnce(async () => {
            const mockRoleList: Awaited<ReturnType<typeof fetchRoleList>> = [
                {
                    _id: mockUserRoleId,
                    title: UserRoleTitles.KLIENT_PACIENT,
                },
            ];
            return mockRoleList;
        });

        const response = await authMiddleware(req, mockNextFetchEvent);
        expect(response?.status).toMatchInlineSnapshot("200");
    });
});
