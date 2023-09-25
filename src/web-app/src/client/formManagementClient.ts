import { Action } from "@/types/formManagement/action";
import { Form, FormSchema } from "@/types/formManagement/forms";
import { Submission } from "@/types/formManagement/submission";
import getFormioUrl from "./formioUrl";
import { RequestError } from "./requestError";
import safeFetch from "./safeFetch";

/**
 * Load form with given path from formio.
 * @param relativeFormPath - Relative path to the form (including leading slash).
 * @param token - JWT token for formio.
 * @returns Form with given path or null if not found.
 * @throws {RequestError} If the returned http status is not OK.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
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
 * @param formId - Id of the form to load.
 * @param token - JWT token for formio.
 * @returns Form with given id or null if not found.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
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
 * @param formioToken - JWT token for formio.
 * @param formSchema - Schema of the form to submit.
 * @returns Created form.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
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
 * @param formioToken - JWT token for formio.
 * @param formPath - Path of the form to submit to (including leading slash).
 * @param submissionData - Form data to submit.
 * @returns Created submission.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
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
 * @param formioToken - JWT token for formio.
 * @param formId - Id of the form to export.
 * @param format - Format of the exported data.
 * @returns Blob with exported data in given format.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} When a network error is encountered or CORS is misconfigured on the server-side.
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
 * @param formioToken - JWT token for formio.
 * @param formPath - Path of the form to delete.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} When a network error is encountered or CORS is misconfigured on the server-side.
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
 * @param formioToken - JWT token for formio.
 * @param formId - Id of the form to delete.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} When a network error is encountered or CORS is misconfigured on the server-side.
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
 * @param root0 - Options for loading forms.
 * @param root0.formioToken - JWT token for formio.
 * @param root0.pagination - Pagination settings.
 * @param root0.pagination.limit - Maximum number of forms to load.
 * @param root0.pagination.offset - Offset of the first form to load.
 * @param root0.sort - Sorting settings.
 * @param root0.sort.field - Field to sort by.
 * @param root0.sort.order - Order to sort by. (ascending or descending).
 * @param root0.tags - List of tags which must be present on the form.
 * @returns List of forms.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 * @throws {Error} If the Content-Range header in the response is invalid or the total count is unknown.
 */
export async function loadForms({
    formioToken,
    pagination,
    sort,
    tags,
}: {
    formioToken: string;
    pagination: {
        limit: number;
        offset: number;
    };
    sort?: {
        field: keyof Form;
        order: "asc" | "desc";
    };
    tags?: string[];
}): Promise<{ data: Form[]; totalCount: number }> {
    const url = new URL(`${getFormioUrl()}/form/`);

    url.searchParams.set("type", "form");

    // paginaton
    url.searchParams.set("limit", pagination.limit.toString());
    url.searchParams.set("skip", pagination.offset.toString());

    if (sort)
        url.searchParams.set(
            `${sort.order === "desc" ? "-" : ""}sort`,
            sort.field
        );

    // https://apidocs.form.io/#cd97fc97-7a86-aa65-8e5a-3e9e6eb4a22d
    if (tags) url.searchParams.set("tags__in", tags.join(","));

    const response = await safeFetch(url.toString(), {
        headers: {
            "x-jwt-token": formioToken,
        },
    });
    const totalCount = Number(
        response.headers.get("Content-Range")?.match(/\d+$/)
    );
    if (isNaN(totalCount)) throw new Error("Invalid Content-Range header.");

    return {
        data: (await response.json()) as Form[],
        totalCount,
    };
}

/**
 * Update form in the form management system.
 * @param formSchema - Form schema to save to server.
 * @param formioToken - JWT token for formio.
 * @returns Updated form.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
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
 * @param formId - Id of the form to create action for.
 * @param action - Definition of the action to create.
 * @param formioToken - JWT token for formio.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
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
 * @param formPath - Path of the form to load submissions from.
 * @param submissionId - Id of the submission to load.
 * @param formioToken - JWT token for formio.
 * @returns Submission or null if the returned status is 404.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
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
 * Get submissions of a form.
 * @param formId - Id of the form to load submissions from.
 * @param formioToken - JWT token for formio.
 * @returns List of submissions.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function loadSubmissions(
    formId: string,
    formioToken: string
): Promise<Submission[]> {
    console.log("Fetching submissions of form...", {
        formId,
    });
    const response = await safeFetch(`${getFormioUrl()}/form/${formId}/submission`, {
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
 * Update submission in the form management system.
 * @param formPath - Path of the form of which to update the submission.
 * @param updatedSubmission - Updated submission (used to replace submission with the same _id).
 * @param formioToken - JWT token for formio.
 * @returns Updated submission.
 * @throws {RequestError}
 * If the http request fails.
 * @throws {TypeError}
 * If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function updateSubmission(
    formPath: string,
    updatedSubmission: Partial<Submission> & Pick<Submission, "data" | "_id">,
    formioToken: string
): Promise<Submission> {
    const response = await safeFetch(
        `${getFormioUrl()}${formPath}/submission/${updatedSubmission._id}`,
        {
            headers: {
                "x-jwt-token": formioToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedSubmission),
            method: "PUT",
        }
    );
    return (await response.json()) as Submission;
}
