import { Action } from "@/types/formManagement/action";
import { Form, FormSchema } from "@/types/formManagement/forms";
import { Submission } from "@/types/formManagement/submission";
import getFormioUrl from "./formioUrl";
import { RequestError } from "./requestError";
import safeFetch from "./safeFetch";

/**
 * Load form with given path from formio.
 * @param relativeFormPath relative path to the form (including leading slash)
 * @param token JWT token for formio
 * @returns form with given path or null if not found
 * @throws {RequestError} if the returned http status is not OK
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function loadFormByPath(
    relativeFormPath: string,
    token: string
): Promise<Form | null> {
    let form: Form;
    try {
        const response = await safeFetch(
            `${getFormioUrl()}${relativeFormPath}`,
            {
                headers: {
                    "x-jwt-token": token,
                },
            }
        );
        form = (await response.json()) as Form;
    } catch (e) {
        if (e instanceof RequestError) {
            if (e.status === 404) return null;
            throw e;
        } else if (e instanceof TypeError) {
            throw e;
        }
        throw new Error("Unexpected error caught", { cause: e });
    }

    return form;
}

/**
 * Load form with given id from formio.
 * @param formId id of the form to load
 * @param token JWT token for formio
 * @returns form with given id or null if not found
 * @throws {RequestError} if the http request fails
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function loadFormById(
    formId: string,
    token: string
): Promise<Form | null> {
    let form: Form;
    try {
        const response = await safeFetch(`${getFormioUrl()}/form/${formId}`, {
            headers: {
                "x-jwt-token": token,
            },
        });
        form = (await response.json()) as Form;
    } catch (e) {
        if (e instanceof RequestError) {
            if (e.status === 404) return null;
            throw e;
        } else if (e instanceof TypeError) {
            throw e;
        }
        throw new Error("Unexpected error caught", { cause: e });
    }

    return form;
}

/**
 * Submit form to formio.
 * @param formioToken JWT token for formio
 * @param formSchema schema of the form to submit
 * @returns created form
 * @throws {RequestError} if the http request fails
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function createForm(
    formioToken: string,
    formSchema: FormSchema
): Promise<Form> {
    const response = await safeFetch(`${getFormioUrl()}/form`, {
        headers: {
            "Content-Type": "application/json",
            "x-jwt-token": formioToken,
        },
        body: JSON.stringify(formSchema),
        method: "POST",
    });
    const form = (await response.json()) as Form;

    return form;
}

/**
 * Make a submission to a formio form.
 * @param formioToken JWT token for formio
 * @param formPath path of the form to submit to (including leading slash)
 * @param submissionData submission data
 * @return created submission
 * @throws {RequestError} if the http request fails
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function submitForm(
    formioToken: string,
    formPath: string,
    submissionData: unknown
): Promise<Submission> {
    const response = await safeFetch(`${getFormioUrl()}${formPath}`, {
        headers: {
            "Content-Type": "application/json",
            "x-jwt-token": formioToken,
        },
        body: JSON.stringify(submissionData),
        method: "POST",
    });
    const createdSubmission = (await response.json()) as Submission;

    return createdSubmission;
}

/**
 * Export form submissions from formio.
 * @param formioToken JWT token for formio
 * @param formId id of the form to export
 * @param format format of the exported data
 * @returns blob with exported data in given format
 * @throws {RequestError} if the http request fails
 * @throws {TypeError} when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function exportFormSubmissions(
    formioToken: string,
    formId: string,
    format: "csv" | "json"
): Promise<Blob> {
    const response = await safeFetch(
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
 * Delete form from the form management system.
 * @param formioToken JWT token for formio
 * @param formPath path of the form to delete
 * @throws {RequestError} if the http request fails
 * @throws {TypeError} when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function deleteForm(
    formioToken: string,
    formPath: string
): Promise<void> {
    await safeFetch(`${getFormioUrl()}${formPath}`, {
        headers: {
            "x-jwt-token": formioToken,
        },
        method: "DELETE",
    });
}

/**
 * Delete form from the form management system.
 * @param formioToken JWT token for formio
 * @param formId id of the form to delete
 * @throws {RequestError} if the http request fails
 * @throws {TypeError} when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function deleteFormById(
    formioToken: string,
    formId: string
): Promise<void> {
    await safeFetch(`${getFormioUrl()}/form/${formId}`, {
        headers: {
            "x-jwt-token": formioToken,
        },
        method: "DELETE",
    });
}

/**
 * Load forms from the form management system.
 * @param formioToken JWT token for formio
 * @param tags list of tags which must be present on the form
 * @return list of forms
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function loadForms(
    formioToken: string,
    tags?: string[]
): Promise<Form[]> {
    const url = new URL(`${getFormioUrl()}/form/`);

    url.searchParams.set("type", "form");
    // https://apidocs.form.io/#cd97fc97-7a86-aa65-8e5a-3e9e6eb4a22d
    if (tags) url.searchParams.set("tags__in", tags.join(","));

    const response = await safeFetch(url.toString(), {
        headers: {
            "x-jwt-token": formioToken,
        },
    });
    return (await response.json()) as Form[];
}

/**
 * Update form in the form management system.
 * @param formSchema Form schema to save to server
 * @returns updated form
 * @throws {RequestError} if the http request fails
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function updateForm(
    formSchema: Form,
    formioToken: string
): Promise<Form> {
    const response = await safeFetch(
        `${getFormioUrl()}/form/${formSchema._id}`,
        {
            headers: {
                "Content-Type": "application/json",
                "x-jwt-token": formioToken,
            },
            method: "PUT",
            body: JSON.stringify(formSchema),
        }
    );
    return (await response.json()) as Form;
}

/**
 * Create action attached to a form in formio.
 * @param formId id of the form to create action for
 * @param action definition of the action to create
 * @param formioToken JWT token for formio
 * @throws {RequestError} if the http request fails
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function createAction<TSettings>(
    formId: string,
    action: Action<TSettings>,
    formioToken: string
): Promise<Action<TSettings>> {
    const response = await safeFetch(
        `${getFormioUrl()}/form/${formId}/action`,
        {
            headers: {
                "Content-Type": "application/json",
                "x-jwt-token": formioToken,
            },
            body: JSON.stringify(action),
            method: "POST",
        }
    );
    return (await response.json()) as Action<TSettings>;
}

/**
 * Load submissions from formio.
 * @param formPath path of the form to load submissions from
 * @param submissionId id of the submission to load
 * @param formioToken JWT token for formio
 * @throws {RequestError} if the http request fails
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 * @returns submission or null if the returned status is 404
 */
export async function loadSubmission(
    formPath: string,
    submissionId: string,
    formioToken: string
): Promise<Submission | null> {
    let response: Response;
    try {
        response = await safeFetch(
            `${getFormioUrl()}/${formPath}/submission/${submissionId}`,
            {
                headers: {
                    "x-jwt-token": formioToken,
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (e) {
        if (e instanceof RequestError) {
            if (e.status === 404) return null;
            throw e;
        } else if (e instanceof TypeError) {
            throw e;
        }
        throw new Error("Unexpected error caught", { cause: e });
    }
    return (await response.json()) as Submission;
}

/**
 * Get submissions of a form
 * @param formId id of the form to load submissions from
 * @param formioToken JWT token for formio
 * @returns list of submissions
 * @throws {RequestError} if the http request fails
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function loadSubmissions(
    formId: string,
    formioToken: string
): Promise<Submission[]> {
    console.log("Fetching submissions of form...", {
        formId,
    });
    const response = await safeFetch(`${getFormioUrl()}/${formId}/submission`, {
        headers: {
            "x-jwt-token": formioToken,
        },
    });
    console.log("Submissions of form fetched.", {
        formId,
    });
    return (await response.json()) as Submission[];
}

/**
 * Update submission in the form management system
 * @param formPath path of the form of which to update the submission
 * @param submissionId id of the submission to update
 * @param data data to update the submission with
 * @param formioToken JWT token for formio
 * @returns updated submission
 * @throws {RequestError} if the http request fails
 * @throws {TypeError} if the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side
 */
export async function updateSubmission(
    formPath: string,
    submissionId: string,
    data: unknown,
    formioToken: string
): Promise<Submission> {
    const response = await safeFetch(
        `${getFormioUrl()}/${formPath}/submission/${submissionId}`,
        {
            headers: {
                "x-jwt-token": formioToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                _id: submissionId,
                data,
            }),
            method: "PUT",
        }
    );
    return (await response.json()) as Submission;
}
