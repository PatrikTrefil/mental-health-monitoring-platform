/**
 * Client methods for interacting with formio.
 *
 * The client from `@formio/formiojs` is not used because it
 * there were some bugs and it does not work on the server.
 * @module formioClient
 */
import { Action } from "@/types/action";
import { Form, FormSchema } from "@/types/forms";
import { Role } from "@/types/role";
import { Submission } from "@/types/submission";
import { UserFormSubmission } from "@/types/userFormSubmission";

/**
 * Find out if the code is running on the server.
 * @returns true if the code is running on the server, false otherwise
 */
function isRunningOnServer() {
    return typeof window === "undefined";
}

/**
 * Get the base url of formio based on the environment (server or client)
 * @returns base url of formio
 */
function getFormioUrl() {
    return isRunningOnServer()
        ? process.env.NEXT_PUBLIC_INTERNAL_NEXT_SERVER_URL
        : process.env.NEXT_PUBLIC_FORMIO_BASE_URL;
}

/**
 * Load form with given path from formio.
 * @param relativeFormPath relative path to the form (including leading slash)
 * @param token JWT token for formio
 * @returns form with given path
 */
export async function loadFormByPath(relativeFormPath: string, token: string) {
    const response = await fetch(`${getFormioUrl()}${relativeFormPath}`, {
        headers: {
            "x-jwt-token": token,
        },
    });

    return (await response.json()) as Form;
}

/**
 * Load form with given id from formio.
 * @param formId id of the form to load
 * @param token JWT token for formio
 * @returns form with given id or null if not found
 * @throws {TypeError} if the fetch or conversion to json fails
 */
export async function loadFormById(
    formId: string,
    token: string
): Promise<Form | null> {
    const response = await fetch(`${getFormioUrl()}/form/${formId}`, {
        headers: {
            "x-jwt-token": token,
        },
    });
    if (response.status === 404) return null;

    return (await response.json()) as Form;
}

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
 * Submit form to formio.
 * @param formioToken JWT token for formio
 * @param formSchema schema of the form to submit
 * @throws {Error} if formio returns a non-ok status
 * @throws {TypeError} if the fetch fails
 * @returns created form
 */
export async function createForm(formioToken: string, formSchema: FormSchema) {
    const response = await fetch(`${getFormioUrl()}/form`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-jwt-token": formioToken,
        },
        body: JSON.stringify(formSchema),
    });
    if (!response.ok) throw new Error((await response.json())?.message);
    return (await response.json()) as Form;
}

/**
 * Make a submission to a formio form.
 * @param formioToken JWT token for formio
 * @param formPath path of the form to submit to (including leading slash)
 * @param submission submission data
 */
export async function submitForm(
    formioToken: string,
    formPath: string,
    submission: unknown
) {
    const response = await fetch(`${getFormioUrl()}${formPath}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-jwt-token": formioToken,
        },
        body: JSON.stringify(submission),
    });
    if (!response.ok) {
        throw new Error(
            `Failed to submit form with status code ${response.status}`
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
 * Export form submissions from formio.
 * @param formioToken JWT token for formio
 * @param formId id of the form to export
 * @param format format of the exported data
 * @returns blob with exported data in given format
 * @throws {TypeError} if the fetch or conversion to blob fails
 */
export async function exportFormSubmissions(
    formioToken: string,
    formId: string,
    format: "csv" | "json"
) {
    const response = await fetch(
        `${getFormioUrl()}/form/${formId}/export?format=${format}`,
        {
            headers: {
                "x-jwt-token": formioToken,
            },
        }
    );
    return response.blob();
}

/**
 * Delete form from formio.
 * @param formioToken JWT token for formio
 * @param formPath path of the form to delete
 * @throws {Error} if formio returns a non-ok status
 * @throws {TypeError} if the fetch fails
 */
export async function deleteForm(formioToken: string, formPath: string) {
    const response = await fetch(`${getFormioUrl()}${formPath}`, {
        method: "DELETE",
        headers: {
            "x-jwt-token": formioToken,
        },
    });
    if (!response.ok)
        throw new Error(`Form deletion failed with status ${response.status}`);
}

/**
 * Load forms from formio.
 * @param formioToken JWT token for formio
 * @param tags list of tags which must be present on the form
 */
export async function loadForms(formioToken: string, tags: string[]) {
    const url = new URL(`${getFormioUrl()}/form/`);

    url.searchParams.set("type", "form");
    // https://apidocs.form.io/#cd97fc97-7a86-aa65-8e5a-3e9e6eb4a22d
    url.searchParams.set("tags__in", tags.join(","));

    const response = await fetch(url, {
        headers: {
            "x-jwt-token": formioToken,
        },
    });

    return (await response.json()) as Form[];
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
 * Create form in formio.
 * @param formSchema Form schema to save to server
 * @throws {TypeError} if the fetch fails
 * @throws {Error} if response status is not ok
 */
export async function updateForm(formSchema: Form, formioToken: string) {
    const response = await fetch(`${getFormioUrl()}/form/${formSchema._id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "x-jwt-token": formioToken,
        },
        body: JSON.stringify(formSchema),
    });

    if (!response.ok)
        throw new Error(
            `Failed to save form with status code ${response.status}`
        );
}

/**
 * Create action attached to a form in formio.
 * @param formId id of the form to create action for
 * @param action definition of the action to create
 * @param formioToken JWT token for formio
 */
export async function createAction<TSettings>(
    formId: string,
    action: Action<TSettings>,
    formioToken: string
) {
    const response = await fetch(`${getFormioUrl()}/form/${formId}/action`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-jwt-token": formioToken,
        },
        body: JSON.stringify(action),
    });
    if (!response.ok)
        throw new Error(
            `Failed to create action with status code ${response.status}`
        );
}

/**
 * Load submissions from formio.
 * @param formPath path of the form to load submissions from
 * @param submissionId id of the submission to load
 * @param formioToken JWT token for formio
 * @throws {TypeError} if the fetch fails
 * @throws {Error} if response status is not ok
 */
export async function loadSubmission(
    formPath: string,
    submissionId: string,
    formioToken: string
) {
    const response = await fetch(
        `${getFormioUrl()}/${formPath}/submission/${submissionId}`,
        {
            headers: {
                "x-jwt-token": formioToken,
                "Content-Type": "application/json",
            },
        }
    );
    if (!response.ok)
        throw new Error(
            `Failed to load submission with status code ${response.status}`
        );
    return (await response.json()) as Submission;
}

/**
 * Get current formio user
 * @param formioToken JWT token for formio
 * @throws {TypeError} if the fetch fails or the response is not valid json
 */
export async function getCurrentUser(formioToken: string) {
    const response = await fetch(`${getFormioUrl()}/current`, {
        headers: {
            "x-jwt-token": formioToken,
        },
    });
    return (await response.json()) as UserFormSubmission;
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
    console.log("Making login request...");
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
 * Error thrown when a fetch request fails.
 */
export class RequestError extends Error {
    /**
     * Status code of the failed request.
     */
    statusCode: number;
    constructor(status: number) {
        super();
        this.statusCode = status;
    }
}

/**
 * Get submissions of a form
 * @param formId id of the form to load submissions from
 * @param formioToken JWT token for formio
 * @returns list of submissions
 * @throws {TypeError} if the fetch fails
 * @throws {RequestError} if the response status is not ok
 */
export async function loadSubmissions(formId: string, formioToken: string) {
    console.log("Fetching submissions of form...", {
        formId,
    });
    const submissionsResponse = await fetch(
        `${getFormioUrl()}/${formId}/submission`,
        {
            headers: {
                "x-jwt-token": formioToken,
            },
        }
    );
    console.log("Submissions of form fetched.", {
        status: submissionsResponse.status,
        formId,
    });
    if (!submissionsResponse.ok)
        throw new RequestError(submissionsResponse.status);

    const submissions = (await submissionsResponse.json()) as Submission[];

    return submissions;
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

/**
 * Update submission in formio
 * @param formPath path of the form of which to update the submission
 * @param submissionId id of the submission to update
 * @param data data to update the submission with
 * @param formioToken JWT token for formio
 * @returns updated submission
 */
export async function updateSubmission(
    formPath: string,
    submissionId: string,
    data: unknown,
    formioToken: string
) {
    const response = await fetch(
        `${getFormioUrl()}/${formPath}/submission/${submissionId}`,
        {
            method: "PUT",
            headers: {
                "x-jwt-token": formioToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                _id: submissionId,
                data,
            }),
        }
    );
    if (!response.ok) throw new RequestError(response.status);
    return (await response.json()) as Submission;
}
