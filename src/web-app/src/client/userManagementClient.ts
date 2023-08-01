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
 * @param formioToken JWT token for formio
 * @returns list of all users
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
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
 * Load user based on user ID
 * @param formioToken JWT token for formio
 * @returns user or null if the user does not exist
 * @throws {RequestError} if the returned http status is not OK (and not 404)
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
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
 * @param formioToken JWT token for formio
 * @param userSubmissionId id of the user submission to delete
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function deleteKlientPacient(
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
 * @param formioToken JWT token for formio
 * @returns list of all roles
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
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
 * @param formioToken JWT token for formio
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
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
 * @param formioToken JWT token for formio
 * @param userSubmissionId id of the user submission to delete
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} when a network error is encountered or CORS is misconfigured on the server-side
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
 * Delete any user
 * @param formioToken JWT token for formio
 * @param userSubmissionId id of the user submission to delete
 * @param userRoleTitle role of the user to delete
 */
export async function deleteUser(
    formioToken: string,
    userSubmissionId: string,
    userRoleTitle: UserRoleTitle
): Promise<void> {
    switch (userRoleTitle) {
        case UserRoleTitles.SPRAVCE_DOTAZNIKU:
            await deleteSpravceDotazniku(formioToken, userSubmissionId);
            break;
        case UserRoleTitles.ZADAVATEL_DOTAZNIKU:
            await deleteZadavatelDotazniku(formioToken, userSubmissionId);
            break;
        case UserRoleTitles.KLIENT_PACIENT:
            await deleteKlientPacient(formioToken, userSubmissionId);
            break;
        default:
            throw new Error(`Unknown user role title: ${userRoleTitle}`);
    }
}

/**
 * Delete employee that is from the zadavatel dotazniku resource from formio.
 * @param formioToken JWT token for formio
 * @param userSubmissionId id of the user submission to delete
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} when a network error is encountered or CORS is misconfigured on the server-side
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
 * @param email email of the admin account
 * @param password password of the admin account
 * @returns JWT token with admin privileges
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} when a network error is encountered or CORS is misconfigured on the server-side
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
 * @param currentToken current JWT token of the user
 * @returns new JWT token
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} when a network error is encountered or CORS is misconfigured on the server-side
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
 * Log in as a user
 * @param id id of the user
 * @param password password of the user
 * @returns user and JWT token
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} when a network error is encountered or CORS is misconfigured on the server-side
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
 * Update any user's account
 * @param submmissionId id of the submission to update
 * @param data new data to update the submission with
 * @param roleTitle title of the role of the user
 * @param formioToken JWT token for formio
 * @returns updated submission
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function updateUser(
    submissionId: string,
    data: { id: string; password: string },
    roleTitle: UserRoleTitle,
    formioToken: string
) {
    switch (roleTitle) {
        case UserRoleTitles.KLIENT_PACIENT:
            await updateKlientPacient(submissionId, data, formioToken);
            break;
        case UserRoleTitles.SPRAVCE_DOTAZNIKU:
            await updateSpravceDotazniku(submissionId, data, formioToken);
            break;
        case UserRoleTitles.ZADAVATEL_DOTAZNIKU:
            await updateSpravceDotazniku(submissionId, data, formioToken);
            break;
        default:
            throw new Error("Unknown user role title.");
    }
}

/**
 * Update user's account (submission)
 * @param submmisionId id of the submission to update
 * @param data new data to update the submission with
 * @param formioToken JWT token for formio
 * @returns updated submission
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function updateKlientPacient(
    submisionId: string,
    data: { id: string; password: string },
    formioToken: string
): Promise<Submission> {
    return updateSubmission(
        "/klientpacient",
        { _id: submisionId, data },
        formioToken
    );
}
/**
 * Update form manager's account (submission)
 * @param submmisionId id of the submission to update
 * @param data new data to update the submission with
 * @param formioToken JWT token for formio
 * @returns updated submission
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function updateSpravceDotazniku(
    submisionId: string,
    data: { id: string; password: string },
    formioToken: string
): Promise<Submission> {
    return updateSubmission(
        "/zamestnanec/spravce-dotazniku",
        { _id: submisionId, data },
        formioToken
    );
}
/**
 * Update form assigner's account (submission)
 * @param submmisionId id of the submission to update
 * @param data new data to update the submission with
 * @param formioToken JWT token for formio
 * @returns updated submission
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function updateZadavatelDotazniku(
    submisionId: string,
    data: { id: string; password: string },
    formioToken: string
): Promise<Submission> {
    return updateSubmission(
        "/zamestnanec/zadavatel-dotazniku",
        { _id: submisionId, data },
        formioToken
    );
}

/**
 * Get current user
 * @param formioToken JWT token of the user
 * @returns current user
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function getCurrentUser(formioToken: string): Promise<User> {
    const response = await safeFetch(`${getFormioUrl()}/current`, {
        headers: {
            "x-jwt-token": formioToken,
        },
    });
    return (await response.json()) as User;
}

/**
 * Create a new user
 * @param data user's login data
 * @param roleTitle role to assign to the user
 * @param formioToken JWT token for formio
 * @returns {Submission} representing the user
 */
export async function createUser(
    data: { id: string; password: string },
    roleTitle: UserRoleTitle,
    formioToken: string
): Promise<Submission> {
    switch (roleTitle) {
        case UserRoleTitles.KLIENT_PACIENT:
            return createKlientPacient(data, formioToken);
        case UserRoleTitles.SPRAVCE_DOTAZNIKU:
            return createSpravceDotazniku(data, formioToken);
        case UserRoleTitles.ZADAVATEL_DOTAZNIKU:
            return createZadavatelDotazniku(data, formioToken);
        default:
            throw new Error("Unknown user role title.");
    }
}

/**
 * Create client/patient
 * @param data user's login data
 * @param formioToken JWT token for formio
 * @returns {Submission} representing the user
 */
export async function createKlientPacient(
    data: { id: string; password: string },
    formioToken: string
): Promise<Submission> {
    const submission = await submitForm(
        formioToken,
        "/klientpacient/register",
        { data }
    );
    // set owner so that the user can change their password
    await updateSubmission(
        "/klientpacient",
        {
            _id: submission._id,
            data,
            owner: submission._id,
        },
        formioToken
    );
    return submission;
}

/**
 * Create form manager
 * @param data user's login data
 * @param formioToken JWT token for formio
 * @returns {Submission} representing the user
 */
export async function createSpravceDotazniku(
    data: { id: string; password: string },
    formioToken: string
): Promise<Submission> {
    const submission = await submitForm(
        formioToken,
        "/zamestnanec/spravce-dotazniku/register",
        { data }
    );
    // set owner so that the user can change their password
    await updateSubmission(
        "/zamestnanec/spravce-dotazniku",
        {
            _id: submission._id,
            data,
            owner: submission._id,
        },
        formioToken
    );
    return submission;
}

/**
 * Create form assigner
 * @param data user's login data
 * @param formioToken JWT token for formio
 * @returns {Submission} representing the user
 */
export async function createZadavatelDotazniku(
    data: { id: string; password: string },
    formioToken: string
): Promise<Submission> {
    const submission = await submitForm(
        formioToken,
        "/zamestnanec/zadavatel-dotazniku/register",
        { data }
    );
    // set owner so that the user can change their password
    await updateSubmission(
        "/zamestnanec/zadavatel-dotazniku",
        {
            _id: submission._id,
            data,
            owner: submission._id,
        },
        formioToken
    );
    return submission;
}
