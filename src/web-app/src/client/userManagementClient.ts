import UserRoleTitles from "@/constants/userRoleTitles";
import { Submission } from "@/types/formManagement/submission";
import { UserRoleTitle } from "@/types/userManagement/UserRoleTitle";
import { Role } from "@/types/userManagement/role";
import { User } from "@/types/userManagement/user";
import { submitForm, updateSubmission } from "./formManagementClient";
import getFormioUrl from "./formioUrl";
import { RequestError } from "./requestError";
import safeFetch from "./safeFetch";

/**
 * Load all users from the user management system.
 * @param root0 - Options.
 * @param root0.filters - Filters to apply.
 * @param root0.token - JWT token for formio.
 * @param root0.pagination - Pagination settings.
 * @param root0.pagination.limit - Maximum number of clients/patients to load.
 * @param root0.pagination.offset - Number of clients/patients that should be skipped.
 * @param root0.sort - Sorting configuration.
 * @param root0.sort.field - Field to sort by.
 * @param root0.sort.order - Ordering of the results (ascending or descending).
 * @returns List of all users.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 * @throws {Error}
 * If the Content-Range header is invalid or unknown.
 */
export async function loadClientsAndPatients({
    token,
    pagination,
    sort,
    filters,
}: {
    token: string;
    pagination: {
        limit: number;
        offset: number;
    };
    sort?: {
        field: string;
        order: "asc" | "desc";
    };
    filters?: {
        fieldPath: string;
        operation: "contains";
        comparedValue: string;
    }[];
}): Promise<{ data: User[]; totalCount: number }> {
    const url = new URL(`${getFormioUrl()}/klientpacient/submission`);

    // pagination
    url.searchParams.set("limit", pagination.limit.toString());
    url.searchParams.set("skip", pagination.offset.toString());

    if (sort)
        url.searchParams.set(
            `${sort.order === "desc" ? "-" : ""}sort`,
            sort.field
        );
    if (filters !== undefined) {
        for (const filter of filters) {
            url.searchParams.set(
                `${filter.fieldPath}__regex`,
                `/${filter.comparedValue}/i`
            );
        }
    }

    const response = await safeFetch(url, {
        headers: {
            "x-jwt-token": token,
        },
    });
    const totalCount = Number(
        response.headers.get("Content-Range")?.match(/\d+$/)
    );
    if (isNaN(totalCount)) throw new Error("Invalid Content-Range header.");

    return { data: (await response.json()) as User[], totalCount };
}

/**
 * Load user based on user ID.
 * @param userSubmissionId - Id of the submission that represents the user.
 * @param token - JWT token for formio.
 * @returns User or null if the user does not exist.
 * @throws {RequestError}
 * If the returned http status is not OK (and not 404).
 * @throws {TypeError}
 * If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function loadClientPatient(
    userSubmissionId: string,
    token: string
): Promise<User | null> {
    let response: Response;
    try {
        response = await safeFetch(
            `${getFormioUrl()}/klientpacient/submission/${userSubmissionId}`,
            {
                headers: {
                    "x-jwt-token": token,
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
 * @param userSubmissionId - Id of the user submission to delete.
 * @param token - JWT token for formio.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * When a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function deleteClientPacient(
    userSubmissionId: string,
    token: string
): Promise<void> {
    await safeFetch(
        `${getFormioUrl()}/klientpacient/submission/${userSubmissionId}`,
        {
            headers: {
                "x-jwt-token": token,
            },
            method: "DELETE",
        }
    );
}
/**
 * Load all roles from the user management system.
 * @param token - JWT token for formio.
 * @returns List of all roles.
 * @throws {RequestError} If the returned http status is not OK.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function loadRoles(token: string): Promise<Role[]> {
    const response = await safeFetch(`${getFormioUrl()}/role`, {
        headers: {
            "x-jwt-token": token,
        },
    });
    return (await response.json()) as Role[];
}

/**
 * Load employees with role {@link UserRoleTitles.SPRAVCE_DOTAZNIKU}.
 * @param root0 - Options.
 * @param root0.token - JWT token for formio.
 * @param root0.pagination - Pagination settings.
 * @param root0.pagination.limit - Maximum number of clients/patients to load.
 * @param root0.pagination.offset - Number of clients/patients that should be skipped.
 * @param root0.sort - Sorting configuration.
 * @param root0.sort.field - Field to sort by.
 * @param root0.sort.order - Ordering of the results (ascending or descending).
 * @param root0.filters - Filters to apply.
 * @throws {Error} If the Content-Range header is invalid or unknown.
 */
export async function loadSpravceDotazniku({
    token,
    pagination,
    sort,
    filters,
}: {
    token: string;
    pagination: {
        limit: number;
        offset: number;
    };
    sort?: {
        field: string;
        order: "asc" | "desc";
    };
    filters?: {
        fieldPath: string;
        operation: "contains";
        comparedValue: string;
    }[];
}): Promise<{
    data: (User & { mainUserRoleTitle: UserRoleTitle })[];
    totalCount: number;
}> {
    const url = new URL(
        `${getFormioUrl()}/zamestnanec/spravce-dotazniku/submission`
    );
    // pagination
    url.searchParams.set("limit", pagination.limit.toString());
    url.searchParams.set("skip", pagination.offset.toString());

    if (sort)
        url.searchParams.set(
            `sort`,
            `${sort.order === "desc" ? "-" : ""}${sort.field}`
        );

    if (filters !== undefined) {
        for (const filter of filters) {
            url.searchParams.set(
                `${filter.fieldPath}__regex`,
                `/${filter.comparedValue}/i`
            );
        }
    }

    const response = await safeFetch(url, {
        headers: {
            "x-jwt-token": token,
        },
    });
    const totalCount = Number(
        response.headers.get("Content-Range")?.match(/\d+$/)
    );
    if (isNaN(totalCount)) throw new Error("Invalid Content-Range header.");

    const data = (await response.json()) as User[];

    return {
        data: data.map((u) => ({
            ...u,
            mainUserRoleTitle: UserRoleTitles.SPRAVCE_DOTAZNIKU,
        })),
        totalCount,
    };
}

/**
 * Load employees with role {@link UserRoleTitles.ZADAVATEL_DOTAZNIKU}.
 * @param root0 - Options.
 * @param root0.token - JWT token for formio.
 * @param root0.pagination - Pagination settings.
 * @param root0.pagination.limit - Maximum number of clients/patients to load.
 * @param root0.pagination.offset - Number of clients/patients that should be skipped.
 * @param root0.sort - Sorting configuration.
 * @param root0.sort.field - Field to sort by.
 * @param root0.sort.order - Ordering of the results (ascending or descending).
 * @param root0.filters - Filters to apply.
 */
export async function loadZadavatelDotazniku({
    token,
    pagination,
    sort,
    filters,
}: {
    token: string;
    pagination: {
        limit: number;
        offset: number;
    };
    sort?: {
        field: string;
        order: "asc" | "desc";
    };
    filters?: {
        fieldPath: string;
        operation: "contains";
        comparedValue: string;
    }[];
}): Promise<{
    data: (User & { mainUserRoleTitle: UserRoleTitle })[];
    totalCount: number;
}> {
    const url = new URL(
        `${getFormioUrl()}/zamestnanec/zadavatel-dotazniku/submission`
    );
    // pagination
    url.searchParams.set("limit", pagination.limit.toString());
    url.searchParams.set("skip", pagination.offset.toString());

    if (sort)
        url.searchParams.set(
            `sort`,
            `${sort.order === "desc" ? "-" : ""}${sort.field}`
        );

    if (filters !== undefined) {
        for (const filter of filters) {
            url.searchParams.set(
                `${filter.fieldPath}__regex`,
                `/${filter.comparedValue}/i`
            );
        }
    }

    const response = await safeFetch(url, {
        headers: {
            "x-jwt-token": token,
        },
    });
    const totalCount = Number(
        response.headers.get("Content-Range")?.match(/\d+$/)
    );
    if (isNaN(totalCount)) throw new Error("Invalid Content-Range header.");

    const data = (await response.json()) as User[];
    return {
        data: data.map((u) => ({
            ...u,
            mainUserRoleTitle: UserRoleTitles.ZADAVATEL_DOTAZNIKU,
        })),
        totalCount,
    };
}

/**
 * Delete an employee that is from the spravce dotazniku resource from
 * the user management system.
 * @param userSubmissionId - Id of the user submission to delete.
 * @param token - JWT token for formio.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * When a network error is encountered or CORS is misconfigured on the server-side.
 */
async function deleteSpravceDotazniku(
    userSubmissionId: string,
    token: string
): Promise<void> {
    await safeFetch(
        `${getFormioUrl()}/zamestnanec/spravce-dotazniku/submission/${userSubmissionId}`,
        {
            headers: {
                "x-jwt-token": token,
            },
            method: "DELETE",
        }
    );
}

/**
 * Delete any user.
 * @param userSubmissionId - Id of the user submission to delete.
 * @param userRoleTitle - Role of the user to delete.
 * @param token - JWT token for formio.
 */
export async function deleteUser(
    userSubmissionId: string,
    userRoleTitle: UserRoleTitle,
    token: string
): Promise<void> {
    switch (userRoleTitle) {
        case UserRoleTitles.SPRAVCE_DOTAZNIKU:
            await deleteSpravceDotazniku(userSubmissionId, token);
            break;
        case UserRoleTitles.ZADAVATEL_DOTAZNIKU:
            await deleteZadavatelDotazniku(userSubmissionId, token);
            break;
        case UserRoleTitles.KLIENT_PACIENT:
            await deleteClientPacient(userSubmissionId, token);
            break;
        default:
            throw new Error(`Unknown user role title: ${userRoleTitle}`);
    }
}

/**
 * Delete employee that is from the zadavatel dotazniku resource from formio.
 * @param userSubmissionId - Id of the user submission to delete.
 * @param token - JWT token for formio.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * When a network error is encountered or CORS is misconfigured on the server-side.
 */
async function deleteZadavatelDotazniku(
    userSubmissionId: string,
    token: string
): Promise<void> {
    await safeFetch(
        `${getFormioUrl()}/zamestnanec/zadavatel-dotazniku/submission/${userSubmissionId}`,
        {
            headers: {
                "x-jwt-token": token,
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
): Promise<{ user: User; token: string }> {
    console.log("Making login request...", {
        url: `${getFormioUrl()}/login`,
    });

    let userFormSubmission: User;
    let token: string;

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
        token = newToken;
    } finally {
        console.log("Login request done.");
    }

    return { user: userFormSubmission, token };
}

/**
 * Update any user's account.
 * @param submissionId - Id of the submission to update.
 * @param data - New data to update the submission with.
 * @param data.id - Id of the user.
 * @param data.password - New password of the user.
 * @param roleTitle - Title of the role of the user.
 * @param token - JWT token for formio.
 * @returns Updated submission.
 * @throws {RequestError} If the returned http status is not OK.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function updateUser(
    submissionId: string,
    data: { id: string; password: string },
    roleTitle: UserRoleTitle,
    token: string
) {
    switch (roleTitle) {
        case UserRoleTitles.KLIENT_PACIENT:
            await updateKlientPacient(submissionId, data, token);
            break;
        case UserRoleTitles.SPRAVCE_DOTAZNIKU:
            await updateSpravceDotazniku(submissionId, data, token);
            break;
        case UserRoleTitles.ZADAVATEL_DOTAZNIKU:
            await updateZadavatelDotazniku(submissionId, data, token);
            break;
        default:
            throw new Error("Unknown user role title.");
    }
}

/**
 * Update user's account (submission).
 * @param submisionId - Id of the submission to update.
 * @param data - New data to update the submission with.
 * @param data.id - Id of the user.
 * @param data.password - New password of the user.
 * @param token - JWT token for formio.
 * @returns Updated submission.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
async function updateKlientPacient(
    submisionId: string,
    data: { id: string; password: string },
    token: string
): Promise<Submission> {
    return updateSubmission(
        "/klientpacient",
        { _id: submisionId, data },
        token
    );
}

/**
 * Update form manager's account (submission).
 * @param submisionId - Id of the submission to update.
 * @param data - New data to update the submission with.
 * @param data.id - Id of the user to update.
 * @param data.password - New password of the user.
 * @param token - JWT token for formio.
 * @returns Updated submission.
 * @throws {RequestError} If the returned http status is not OK.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
function updateSpravceDotazniku(
    submisionId: string,
    data: { id: string; password: string },
    token: string
): Promise<Submission> {
    return updateSubmission(
        "/zamestnanec/spravce-dotazniku",
        { _id: submisionId, data },
        token
    );
}

/**
 * Update form assigner's account (submission).
 * @param submisionId - Id of the submission to update.
 * @param data - New data to update the submission with.
 * @param data.id - Id of the user to update.
 * @param data.password - New password of the user.
 * @param token - JWT token for formio.
 * @returns Updated submission.
 * @throws {RequestError} If the returned http status is not OK.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
async function updateZadavatelDotazniku(
    submisionId: string,
    data: { id: string; password: string },
    token: string
): Promise<Submission> {
    return updateSubmission(
        "/zamestnanec/zadavatel-dotazniku",
        { _id: submisionId, data },
        token
    );
}

/**
 * Get current user.
 * @param token - JWT token of the user.
 * @returns Current user.
 * @throws {RequestError}
 * If the returned http status is not OK.
 * @throws {TypeError}
 * If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function getCurrentUser(token: string): Promise<User> {
    const response = await safeFetch(`${getFormioUrl()}/current`, {
        headers: {
            "x-jwt-token": token,
        },
    });
    return (await response.json()) as User;
}

/**
 * Create a new user.
 * @param data - User's login data.
 * @param data.id - Id of the new user.
 * @param data.password - Password of the new user.
 * @param roleTitle - Role to assign to the user.
 * @param token - JWT token for formio.
 * @returns Representing the user.
 */
export async function createUser(
    data: { id: string; password: string },
    roleTitle: UserRoleTitle,
    token: string
): Promise<Submission> {
    switch (roleTitle) {
        case UserRoleTitles.KLIENT_PACIENT:
            return createKlientPacient(data, token);
        case UserRoleTitles.SPRAVCE_DOTAZNIKU:
            return createSpravceDotazniku(data, token);
        case UserRoleTitles.ZADAVATEL_DOTAZNIKU:
            return createZadavatelDotazniku(data, token);
        default:
            throw new Error("Unknown user role title.");
    }
}

/**
 * Create client/patient.
 * @param data - User's login data.
 * @param data.id - Id of the new user.
 * @param data.password - Password of the new user.
 * @param token - JWT token for formio.
 * @returns Representing the user.
 */
async function createKlientPacient(
    data: { id: string; password: string },
    token: string
): Promise<Submission> {
    const submission = await submitForm(
        "/klientpacient/register",
        { data },
        token
    );
    // set owner so that the user can change their password
    await updateSubmission(
        "/klientpacient",
        {
            _id: submission._id,
            data,
            owner: submission._id,
        },
        token
    );
    return submission;
}

/**
 * Create form manager.
 * @param data - User's login data.
 * @param data.id - Id of the new user.
 * @param data.password - Password of the new user.
 * @param token - JWT token for formio.
 * @returns Representing the user.
 */
async function createSpravceDotazniku(
    data: { id: string; password: string },
    token: string
): Promise<Submission> {
    const submission = await submitForm(
        "/zamestnanec/spravce-dotazniku/register",
        { data },
        token
    );
    // set owner so that the user can change their password
    await updateSubmission(
        "/zamestnanec/spravce-dotazniku",
        {
            _id: submission._id,
            data,
            owner: submission._id,
        },
        token
    );
    return submission;
}

/**
 * Create form assigner.
 * @param data - User's login data.
 * @param data.id - Id of the new user.
 * @param data.password - Password of the new user.
 * @param token - JWT token for formio.
 * @returns Representing the user.
 */
async function createZadavatelDotazniku(
    data: { id: string; password: string },
    token: string
): Promise<Submission> {
    const submission = await submitForm(
        "/zamestnanec/zadavatel-dotazniku/register",
        { data },
        token
    );
    // set owner so that the user can change their password
    await updateSubmission(
        "/zamestnanec/zadavatel-dotazniku",
        {
            _id: submission._id,
            data,
            owner: submission._id,
        },
        token
    );
    return submission;
}
