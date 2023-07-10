import { Role } from "@/types/role";
import getFormioUrl from "./formioUrl";

import { UserFormSubmission } from "@/types/userFormSubmission";
import { updateSubmission } from "./formManagementClient";
import { RequestError } from "./requestError";

/**
 * Load all users from formio.
 * @param formioToken JWT token for formio
 * @returns list of all users
 * @throws {TypeError} if the fetch or conversion to json fails
 */

export async function loadUsers(formioToken: string) {
    const response = await fetch(`${getFormioUrl()}/klientpacient/submission`, {
        headers: {
            "x-jwt-token": formioToken,
        },
    });

    return (await response.json()) as UserFormSubmission[];
}
/**
 * Delete user from formio.
 * @param formioToken JWT token for formio
 * @param userSubmissionId id of the user submission to delete
 * @throws {Error} if formio returns a non-ok status
 * @throws {TypeError} if the fetch fails
 */

export async function deleteUser(
    formioToken: string,
    userSubmissionId: string
) {
    const response = await fetch(
        `${getFormioUrl()}/klientpacient/submission/${userSubmissionId}`,
        {
            method: "DELETE",
            headers: {
                "x-jwt-token": formioToken,
            },
        }
    );
    if (!response.ok) {
        throw new Error(
            `Failed to delete user with status code ${response.status}`
        );
    }
}
/**
 * Load all roles from formio.
 * @param formioToken JWT token for formio
 * @returns list of all roles
 * @throws {TypeError} if the fetch or conversion to json fails
 */

export async function loadRoles(formioToken: string) {
    const response = await fetch(`${getFormioUrl()}/role`, {
        headers: {
            "x-jwt-token": formioToken,
        },
    });
    return (await response.json()) as Role[];
}
/**
 * Load employees from formio.
 * @param formioToken JWT token for formio
 * @throws {TypeError} if the fetch or conversion to json fails
 */

export async function loadEmployees(formioToken: string) {
    const spravceDotaznikuResponse = await fetch(
        `${getFormioUrl()}/zamestnanec/spravce-dotazniku/submission`,
        {
            headers: {
                "x-jwt-token": formioToken,
            },
        }
    );

    const zadavatelDotaznikuResponse = await fetch(
        `${getFormioUrl()}/zamestnanec/zadavatel-dotazniku/submission`,
        {
            headers: {
                "x-jwt-token": formioToken,
            },
        }
    );

    const spravciDotazniku =
        (await spravceDotaznikuResponse.json()) as UserFormSubmission[];
    const zadavateleDotazniku =
        (await zadavatelDotaznikuResponse.json()) as UserFormSubmission[];

    return spravciDotazniku.concat(zadavateleDotazniku);
}
/**
 * Delete an employee that is from the spravce dotazniku resource from formio.
 * @param formioToken JWT token for formio
 * @param userSubmissionId id of the user submission to delete
 * @throws {Error} if formio returns a non-ok status
 * @throws {TypeError} if the fetch fails
 */

export async function deleteSpravceDotazniku(
    formioToken: string,
    userSubmissionId: string
) {
    const response = await fetch(
        `${getFormioUrl()}/zamestnanec/spravce-dotazniku/submission/${userSubmissionId}`,
        {
            method: "DELETE",
            headers: {
                "x-jwt-token": formioToken,
            },
        }
    );
    if (!response.ok) {
        throw new Error(
            `Failed to delete user with status code ${response.status}`
        );
    }
}
/**
 * Delete employee that is from the zadavatel dotazniku resource from formio.
 * @param formioToken JWT token for formio
 * @param userSubmissionId id of the user submission to delete
 * @throws {Error} if formio returns a non-ok status
 * @throws {TypeError} if the fetch fails
 */

export async function deleteZadavatelDotazniku(
    formioToken: string,
    userSubmissionId: string
) {
    const response = await fetch(
        `${getFormioUrl()}/zamestnanec/zadavatel-dotazniku/submission/${userSubmissionId}`,
        {
            method: "DELETE",
            headers: {
                "x-jwt-token": formioToken,
            },
        }
    );
    if (!response.ok) {
        throw new Error(
            `Failed to delete user with status code ${response.status}`
        );
    }
}
/**
 * Fetches the list of roles from the server.
 * @param adminToken JWT token with admin privileges
 * @returns list of roles
 * @throws RequestError if the request's status is not ok
 * @throws TypeError if the request completely fails
 */

export async function fetchRoleList(adminToken: string) {
    console.log("Fetching role list...");
    const roleListResponse = await fetch(`${getFormioUrl()}/role`, {
        headers: {
            "x-jwt-token": adminToken,
        },
    });
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
 * Logs in the admin account and returns the token.
 * @param email email of the admin account
 * @param password password of the admin account
 * @returns JWT token with admin privileges
 * @throws RequestError if the request's status is not ok
 * @throws TypeError if the request completely fails
 */

export async function loginAdmin(email: string, password: string) {
    console.log("Making admin login request...");
    const adminLoginResponse = await fetch(`${getFormioUrl()}/user/login`, {
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
    });
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
 * Refreshes the token of a user.
 * @param currentToken current JWT token of the user
 * @throws RequestError if the request's status is not ok
 * @throws TypeError if the request completely fails
 */

export async function refreshToken(currentToken: string) {
    console.log("Refreshing token...");
    const refreshResponse = await fetch(`${getFormioUrl()}/current`, {
        headers: {
            "x-jwt-token": currentToken,
        },
    });
    if (!refreshResponse.ok) throw new RequestError(refreshResponse.status);
    const newToken = refreshResponse.headers.get("x-jwt-token");
    if (!newToken) throw new Error("No token received");
    console.log("Token refreshed.");
    return newToken;
}
/**
 * Log in as a user
 * @param id id of the user
 * @param password password of the user
 * @returns user and JWT token
 * @throws RequestError if the request's status is not ok
 * @throws TypeError if the request completely fails
 */

export async function loginUser(id: string, password: string) {
    console.log("Making login request...", {
        url: `${getFormioUrl()}/login`,
    });
    const loginResponse = await fetch(`${getFormioUrl()}/login`, {
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
    });
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
 * Update user's account (submission)
 * @param submmisionId id of the submission to update
 * @param data new data to update the submission with
 * @param formioToken JWT token for formio
 * @returns udpated submission
 */

export async function updateUser(
    submisionId: string,
    data: { id: string; password: string },
    formioToken: string
) {
    return updateSubmission("/klientpacient", submisionId, data, formioToken);
}
