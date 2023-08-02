import { Submission } from "@/types/formManagement/submission";
import { Role } from "@/types/userManagement/role";
import { User } from "@/types/userManagement/user";
import { updateSubmission } from "./formManagementClient";
import getFormioUrl from "./formioUrl";
import { RequestError } from "./requestError";
import safeFetch from "./safeFetch";

/**
 * Load all users from the user management system.
 * @param formioToken - JWT token for formio.
 * @returns List of all users.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function loadUsers(formioToken: string): Promise<User[]> {
    const response = await safeFetch(
        `${getFormioUrl()}/klientpacient/submission`,
        {
            headers: {
                "x-jwt-token": formioToken,
            },
        }
    );
    return (await response.json()) as User[];
}

/**
 * Load user based on user ID.
 * @param formioToken - JWT token for formio.
 * @param userSubmissionId - Id of the submission that represents the user.
 * @returns User or null if the user does not exist.
 * @throws {RequestError}
 * If the returned http status is not OK (and not 404).
 * @throws {TypeError}
 * If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function loadUser(
    formioToken: string,
    userSubmissionId: string
): Promise<User | null> {
    let response: Response;
    try {
        response = await safeFetch(
            `${getFormioUrl()}/klientpacient/submission/${userSubmissionId}`,
            {
                headers: {
                    "x-jwt-token": formioToken,
                },
            }
        );
    } catch (e) {
        if (e instanceof RequestError && e.status === 404) {
            return null;
        }
        throw e;
    }
    return (await response.json()) as User;
}

/**
 * Delete user from the user management system.
 * @param formioToken - JWT token for formio.
 * @param userSubmissionId - Id of the user submission to delete.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * When a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function deleteUser(
    formioToken: string,
    userSubmissionId: string
): Promise<void> {
    await safeFetch(
        `${getFormioUrl()}/klientpacient/submission/${userSubmissionId}`,
        {
            headers: {
                "x-jwt-token": formioToken,
            },
            method: "DELETE",
        }
    );
}
/**
 * Load all roles from the user management system.
 * @param formioToken - JWT token for formio.
 * @returns List of all roles.
 * @throws {RequestError} If the returned http status is not OK.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function loadRoles(formioToken: string): Promise<Role[]> {
    const response = await safeFetch(`${getFormioUrl()}/role`, {
        headers: {
            "x-jwt-token": formioToken,
        },
    });
    return (await response.json()) as Role[];
}

/**
 * Load employees from the user management system.
 * @param formioToken - JWT token for formio.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function loadEmployees(formioToken: string): Promise<User[]> {
    const spravceDotaznikuResponse = await safeFetch(
        `${getFormioUrl()}/zamestnanec/spravce-dotazniku/submission`,
        {
            headers: {
                "x-jwt-token": formioToken,
            },
        }
    );

    const zadavatelDotaznikuResponse = await safeFetch(
        `${getFormioUrl()}/zamestnanec/zadavatel-dotazniku/submission`,
        {
            headers: {
                "x-jwt-token": formioToken,
            },
        }
    );

    const spravciDotazniku = (await spravceDotaznikuResponse.json()) as User[];
    const zadavateleDotazniku =
        (await zadavatelDotaznikuResponse.json()) as User[];

    return spravciDotazniku.concat(zadavateleDotazniku);
}

/**
 * Delete an employee that is from the spravce dotazniku resource from
 * the user management system.
 * @param formioToken - JWT token for formio.
 * @param userSubmissionId - Id of the user submission to delete.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * When a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function deleteSpravceDotazniku(
    formioToken: string,
    userSubmissionId: string
): Promise<void> {
    await safeFetch(
        `${getFormioUrl()}/zamestnanec/spravce-dotazniku/submission/${userSubmissionId}`,
        {
            headers: {
                "x-jwt-token": formioToken,
            },
            method: "DELETE",
        }
    );
}

/**
 * Delete employee that is from the zadavatel dotazniku resource from formio.
 * @param formioToken - JWT token for formio.
 * @param userSubmissionId - Id of the user submission to delete.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * When a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function deleteZadavatelDotazniku(
    formioToken: string,
    userSubmissionId: string
): Promise<void> {
    await safeFetch(
        `${getFormioUrl()}/zamestnanec/zadavatel-dotazniku/submission/${userSubmissionId}`,
        {
            headers: {
                "x-jwt-token": formioToken,
            },
            method: "DELETE",
        }
    );
}

/**
 * Logs in the admin account and returns the token.
 * @param email - Email of the admin account.
 * @param password - Password of the admin account.
 * @returns JWT token with admin privileges.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * When a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function loginAdmin(
    email: string,
    password: string
): Promise<string> {
    console.log("Making admin login request...");
    const adminLoginResponse = await safeFetch(`${getFormioUrl()}/user/login`, {
        headers: {
            "Content-type": "application/json; charset=utf-8",
        },
        method: "POST",
        body: JSON.stringify({
            data: {
                email,
                password,
            },
        }),
    });

    const adminToken = adminLoginResponse.headers.get("x-jwt-token");

    if (!adminToken) throw new RequestError("No token received");

    return adminToken;
}

/**
 * Refreshes the token of a user.
 * @param currentToken - Current JWT token of the user.
 * @returns New JWT token.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * When a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function refreshToken(currentToken: string): Promise<string> {
    console.log("Refreshing token...");
    const refreshResponse = await safeFetch(`${getFormioUrl()}/current`, {
        headers: {
            "x-jwt-token": currentToken,
        },
    });
    const newToken = refreshResponse.headers.get("x-jwt-token");

    if (!newToken) throw new RequestError("No token received");

    console.log("Token refreshed.");

    return newToken;
}

/**
 * Log in as a user.
 * @param id - Id of the user.
 * @param password - Password of the user.
 * @returns User and JWT token.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * When a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function loginUser(
    id: string,
    password: string
): Promise<{ user: User; formioToken: string }> {
    console.log("Making login request...", {
        url: `${getFormioUrl()}/login`,
    });

    let userFormSubmission: User;
    let formioToken: string;

    try {
        const response = await safeFetch(`${getFormioUrl()}/login`, {
            headers: {
                "Content-type": "application/json; charset=utf-8",
            },
            method: "POST",
            body: JSON.stringify({
                data: {
                    id,
                    password,
                },
            }),
        });
        userFormSubmission = (await response.json()) as User;
        const newToken = response.headers.get("x-jwt-token");
        if (!newToken) throw new RequestError("No token received");
        formioToken = newToken;
    } finally {
        console.log("Login request done.");
    }

    return { user: userFormSubmission, formioToken };
}

/**
 * Update user's account (submission).
 * @param submisionId - Id of the submission to update.
 * @param data - New data to update the submission with.
 * @param data.id - Id of the user.
 * @param data.password - New password of the user.
 * @param formioToken - JWT token for formio.
 * @returns Updated submission.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function updateUser(
    submisionId: string,
    data: { id: string; password: string },
    formioToken: string
): Promise<Submission> {
    return updateSubmission("/klientpacient", submisionId, data, formioToken);
}
/**
 * Get current user.
 * @param formioToken - JWT token of the user.
 * @returns Current user.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function getCurrentUser(formioToken: string): Promise<User> {
    const response = await safeFetch(`${getFormioUrl()}/current`, {
        headers: {
            "x-jwt-token": formioToken,
        },
    });
    return (await response.json()) as User;
}
