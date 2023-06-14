/**
 * Client methods for interacting with formio.
 *
 * The client from `@formio/formiojs` is not used because it
 * there were some bugs and it does not work on the server.
 * @module formioClient
 */
import { Form } from "@/types/form";
import { Role } from "@/types/role";
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
        ? process.env.FORMIO_SERVER_URL
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
 */
export async function createForm(formioToken: string, formSchema: unknown) {
    const response = await fetch(`${getFormioUrl()}/form`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-jwt-token": formioToken,
        },
        body: JSON.stringify(formSchema),
    });
    if (!response.ok)
        throw new Error(
            `Form submission failed with status ${response.status}`
        );
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
    const response = await fetch(`${getFormioUrl()}/zamestnanec/submission`, {
        headers: {
            "x-jwt-token": formioToken,
        },
    });

    return (await response.json()) as UserFormSubmission[];
}

/**
 * Delete employee from formio.
 * @param formioToken JWT token for formio
 * @param userSubmissionId id of the user submission to delete
 * @throws {Error} if formio returns a non-ok status
 * @throws {TypeError} if the fetch fails
 */
export async function deleteEmployee(
    formioToken: string,
    userSubmissionId: string
) {
    const response = await fetch(
        `${getFormioUrl()}/zamestnanec/submission/${userSubmissionId}`,
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
