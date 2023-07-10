import { Submission } from "@/types/formManagement/submission";
import { Role } from "@/types/userManagement/role";
import { User } from "@/types/userManagement/user";
import axios, { AxiosResponse } from "axios";
import { updateSubmission } from "./formManagementClient";
import getFormioUrl from "./formioUrl";
import { RequestError } from "./requestError";

/**
 * Load all users from the user management system.
 * @param formioToken JWT token for formio
 * @returns list of all users
 * @throws {RequestError} if the http request fails
 */
export async function loadUsers(formioToken: string): Promise<User[]> {
    try {
        const { data } = await axios.get<unknown>(
            `${getFormioUrl()}/klientpacient/submission`,
            {
                headers: {
                    "x-jwt-token": formioToken,
                },
            }
        );
        return data as User[];
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to load users", e.status);
        else throw new Error("Unexpected error caught", { cause: e });
    }
}

/**
 * Delete user from the user management system.
 * @param formioToken JWT token for formio
 * @param userSubmissionId id of the user submission to delete
 * @throws {RequestError} if the http request fails
 */
export async function deleteUser(
    formioToken: string,
    userSubmissionId: string
): Promise<void> {
    try {
        await axios.delete(
            `${getFormioUrl()}/klientpacient/submission/${userSubmissionId}`,
            {
                headers: {
                    "x-jwt-token": formioToken,
                },
            }
        );
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to delete user", e.status);
        else throw new Error("Unexpected error caught", { cause: e });
    }
}
/**
 * Load all roles from the user management system.
 * @param formioToken JWT token for formio
 * @returns list of all roles
 * @throws {RequestError} if the http request fails
 */
export async function loadRoles(formioToken: string): Promise<Role[]> {
    try {
        const { data } = await axios.get<unknown>(`${getFormioUrl()}/role`, {
            headers: {
                "x-jwt-token": formioToken,
            },
        });
        return data as Role[];
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to load roles", e.status);
        else throw new Error("Unexpected error caught", { cause: e });
    }
}

/**
 * Load employees from the user management system.
 * @param formioToken JWT token for formio
 * @throws {RequestError} if the http request fails
 */
export async function loadEmployees(formioToken: string): Promise<User[]> {
    const spravceDotaznikuResponse = await axios.get<unknown>(
        `${getFormioUrl()}/zamestnanec/spravce-dotazniku/submission`,
        {
            headers: {
                "x-jwt-token": formioToken,
            },
        }
    );

    const zadavatelDotaznikuResponse = await axios.get<unknown>(
        `${getFormioUrl()}/zamestnanec/zadavatel-dotazniku/submission`,
        {
            headers: {
                "x-jwt-token": formioToken,
            },
        }
    );

    const spravciDotazniku = spravceDotaznikuResponse.data as User[];
    const zadavateleDotazniku = zadavatelDotaznikuResponse.data as User[];

    return spravciDotazniku.concat(zadavateleDotazniku);
}

/**
 * Delete an employee that is from the spravce dotazniku resource from
 * the user management system.
 * @param formioToken JWT token for formio
 * @param userSubmissionId id of the user submission to delete
 * @throws {RequestError} if the http request fails
 */
export async function deleteSpravceDotazniku(
    formioToken: string,
    userSubmissionId: string
): Promise<void> {
    try {
        await axios.delete(
            `${getFormioUrl()}/zamestnanec/spravce-dotazniku/submission/${userSubmissionId}`,
            {
                headers: {
                    "x-jwt-token": formioToken,
                },
            }
        );
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to delete user", e.status);
        else throw new Error("Unexpected error caught", { cause: e });
    }
}

/**
 * Delete employee that is from the zadavatel dotazniku resource from formio.
 * @param formioToken JWT token for formio
 * @param userSubmissionId id of the user submission to delete
 * @throws {RequestError} if the http request fails
 */
export async function deleteZadavatelDotazniku(
    formioToken: string,
    userSubmissionId: string
): Promise<void> {
    try {
        await axios.delete(
            `${getFormioUrl()}/zamestnanec/zadavatel-dotazniku/submission/${userSubmissionId}`,
            {
                headers: {
                    "x-jwt-token": formioToken,
                },
            }
        );
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to delete user", e.status);
        else throw new Error("Unexpected error caught", { cause: e });
    }
}

/**
 * Logs in the admin account and returns the token.
 * @param email email of the admin account
 * @param password password of the admin account
 * @returns JWT token with admin privileges
 * @throws {RequestError} if the http request fails
 */
export async function loginAdmin(
    email: string,
    password: string
): Promise<string> {
    console.log("Making admin login request...");
    let adminLoginResponse: AxiosResponse<unknown, any>;
    try {
        adminLoginResponse = await axios.post<unknown>(
            `${getFormioUrl()}/user/login`,
            {
                data: {
                    email,
                    password,
                },
            },
            {
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                },
            }
        );
    } catch (e) {
        throw e;
    }

    const adminToken = adminLoginResponse.headers["x-jwt-token"];

    if (typeof adminToken !== "string")
        throw new RequestError("No token received");

    return adminToken;
}

/**
 * Refreshes the token of a user.
 * @param currentToken current JWT token of the user
 * @throws {RequestError} if the http request fails
 * @returns new JWT token
 */
export async function refreshToken(currentToken: string): Promise<string> {
    console.log("Refreshing token...");
    let refreshResponse: AxiosResponse<unknown, any>;
    try {
        refreshResponse = await axios.get<unknown>(
            `${getFormioUrl()}/current`,
            {
                headers: {
                    "x-jwt-token": currentToken,
                },
            }
        );
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to refresh token", e.status);
        else throw new Error("Unexpected error caught", { cause: e });
    }
    const newToken = refreshResponse.headers["x-jwt-token"];

    if (typeof newToken !== "string")
        throw new RequestError("No token received");

    console.log("Token refreshed.");

    return newToken;
}

/**
 * Log in as a user
 * @param id id of the user
 * @param password password of the user
 * @returns user and JWT token
 * @throws {RequestError} if the http request fails
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
        const { data, headers } = await axios.post<unknown>(
            `${getFormioUrl()}/login`,
            {
                data: {
                    id,
                    password,
                },
            },
            {
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                },
            }
        );
        userFormSubmission = data as User;
        formioToken = headers["x-jwt-token"];
        if (typeof formioToken !== "string")
            throw new RequestError("No token received");
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to login", e.status);
        else throw new Error("Unexpected error caught", { cause: e });
    } finally {
        console.log("Login request done.");
    }

    return { user: userFormSubmission, formioToken };
}

/**
 * Update user's account (submission)
 * @param submmisionId id of the submission to update
 * @param data new data to update the submission with
 * @param formioToken JWT token for formio
 * @returns updated submission
 * @throws {RequestError} if the http request fails
 */
export async function updateUser(
    submisionId: string,
    data: { id: string; password: string },
    formioToken: string
): Promise<Submission> {
    return updateSubmission("/klientpacient", submisionId, data, formioToken);
}
/**
 * Get current user
 * @param formioToken JWT token of the user
 * @throws {RequestError} if the http request fails
 * @returns current user
 */
export async function getCurrentUser(formioToken: string): Promise<User> {
    try {
        const { data } = await axios.get<unknown>(`${getFormioUrl()}/current`, {
            headers: {
                "x-jwt-token": formioToken,
            },
        });
        return data as User;
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to get current user", e.status);
        else throw new Error("Unexpected error caught", { cause: e });
    }
}
