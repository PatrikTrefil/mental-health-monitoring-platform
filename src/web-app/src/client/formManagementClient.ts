import { Action } from "@/types/action";
import getFormioUrl from "./formioUrl";

import { Form, FormSchema } from "@/types/forms";
import { Submission } from "@/types/submission";
import { UserFormSubmission } from "@/types/userFormSubmission";
import { RequestError } from "./requestError";

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
    const body = await response.json();
    if (!response.ok)
        throw new Error(
            typeof body === "object" && body !== null && "message" in body
                ? String(body?.message)
                : undefined
        );
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
