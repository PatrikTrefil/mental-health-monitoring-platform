import {
    getCurrentUser,
    loadRoles,
    loginAdmin,
} from "@/client/userManagementClient";
import UserRoleTitles from "@/constants/userRoleTitles";
import { stackMiddlewares } from "@/middleware/stackMiddleware";
import withAuth from "@/middleware/withAuth";
import { UserRoleTitle } from "@/types/userManagement/UserRoleTitle";
import { faker } from "@faker-js/faker";
import { NextRequestWithAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

// make tests deterministic
faker.seed(123);

const authMiddleware = stackMiddlewares([withAuth]);

const mockInvalidUserToken = "invalid user token;";
const mockValidUserToken = "valid user token";
const mockValidAdminToken = "valid admin token";

const mockUserRoleId = faker.string.alpha(10);

vi.mock("@/client/userManagementClient", () => ({
    getCurrentUser: vi.fn(async (token: string) => {
        if (token === mockInvalidUserToken) throw new TypeError();
        else if (token === mockValidUserToken) {
            const mockUser: Awaited<ReturnType<typeof getCurrentUser>> = {
                _id: faker.string.uuid(),
                data: { id: faker.string.alpha(5) },
                created: faker.date.recent().toISOString(),
                owner: faker.string.uuid(),
                access: [],
                form: faker.string.uuid(),
                roles: [mockUserRoleId],
                metadata: {},
            };
            return mockUser;
        }
        throw new Error("Unexpected token");
    }),
    loadRoles: vi.fn(),
    loginAdmin: vi.fn(),
}));

const mockNextFetchEvent = {} as any; // There is a problem with standard instantiation of NextFetchEvent

type TestInput = {
    roleTitleToTest: UserRoleTitle;
    pathToTest: string;
};

describe.each<TestInput>([
    {
        roleTitleToTest: UserRoleTitles.ASSIGNEE,
        pathToTest: "http://localhost/uzivatel/prehled",
    },
    {
        roleTitleToTest: UserRoleTitles.FORM_MANAGER,
        pathToTest: "http://localhost/zamestnanec/sprava-formularu",
    },
    {
        roleTitleToTest: UserRoleTitles.ASSIGNER,
        pathToTest: "http://localhost/zamestnanec/sprava-formularu",
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
                        roles: [],
                        formioTokenExpiration: Infinity,
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
                        // rest of user object should be irrelevant
                        _id: "",
                        email: "",
                        created: "",
                        access: [],
                        data: { id: "" },
                        form: "",
                        formioToken: "",
                        metadata: {},
                        owner: "",
                        roles: [],
                        formioTokenExpiration: Infinity,
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

        vi.mocked(loadRoles).mockImplementationOnce(async () => {
            const mockRoleList: Awaited<ReturnType<typeof loadRoles>> = [
                {
                    _id: mockUserRoleId,
                    title: UserRoleTitles.ASSIGNEE,
                },
            ];
            return mockRoleList;
        });

        const response = await authMiddleware(req, mockNextFetchEvent);
        expect(response?.status).toMatchInlineSnapshot("200");
    });
});
