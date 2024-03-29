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
 * @param formSchema - Schema of the form to submit.
 * @param token - JWT token for formio.
 * @returns Created form.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function createForm(
    formSchema: FormSchema,
    token: string
): Promise<Form> {
    const response = await safeFetch(`${getFormioUrl()}/form`, {
        headers: {
            "Content-Type": "application/json",
            "x-jwt-token": token,
        },
        body: JSON.stringify(formSchema),
        method: "POST",
    });
    const form = (await response.json()) as Form;

    return form;
}

/**
 * Make a submission to a formio form.
 * @param formPath - Path of the form to submit to (including leading slash).
 * @param submissionData - Form data to submit.
 * @param token - JWT token for formio.
 * @returns Created submission.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function submitForm(
    formPath: string,
    submissionData: unknown,
    token: string
): Promise<Submission> {
    const response = await safeFetch(`${getFormioUrl()}${formPath}`, {
        headers: {
            "Content-Type": "application/json",
            "x-jwt-token": token,
        },
        body: JSON.stringify(submissionData),
        method: "POST",
    });
    const createdSubmission = (await response.json()) as Submission;

    return createdSubmission;
}

/**
 * Export form submissions from formio.
 * @param formId - Id of the form to export.
 * @param root0 - Options for exporting form submissions.
 * @param root0.format - Format to export the submissions in.
 * @param root0.filters - List of filters to apply.
 * @param root0.token - JWT token for formio.
 * @returns Blob with exported data in given format.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} When a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function exportFormSubmissions(
    formId: string,
    {
        format,
        filters,
        token,
    }: {
        token: string;
        format: "csv" | "json";
        filters?: {
            fieldPath: string;
            operation: "contains";
            comparedValue: string;
        }[];
    }
): Promise<Blob> {
    const url = new URL(`${getFormioUrl()}/form/${formId}/export`);

    url.searchParams.set("format", format);

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
    return response.blob();
}

/**
 * Delete form from the form management system.
 * @param formPath - Path of the form to delete.
 * @param token - JWT token for formio.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} When a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function deleteForm(
    formPath: string,
    token: string
): Promise<void> {
    await safeFetch(`${getFormioUrl()}${formPath}`, {
        headers: {
            "x-jwt-token": token,
        },
        method: "DELETE",
    });
}

/**
 * Delete form from the form management system.
 * @param formId - Id of the form to delete.
 * @param token - JWT token for formio.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} When a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function deleteFormById(
    formId: string,
    token: string
): Promise<void> {
    await safeFetch(`${getFormioUrl()}/form/${formId}`, {
        headers: {
            "x-jwt-token": token,
        },
        method: "DELETE",
    });
}

/**
 * Load forms from the form management system.
 * @param root0 - Options for loading forms.
 * @param root0.token - JWT token for formio.
 * @param root0.pagination - Pagination settings.
 * @param root0.pagination.limit - Maximum number of forms to load.
 * @param root0.pagination.offset - Offset of the first form to load.
 * @param root0.sort - Sorting settings.
 * @param root0.sort.field - Field to sort by.
 * @param root0.sort.order - Order to sort by. (ascending or descending).
 * @param root0.tags - List of tags which must be present on the form.
 * @param root0.filters - List of filters to apply.
 * @returns List of forms.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 * @throws {Error} If the Content-Range header in the response is invalid or the total count is unknown.
 */
export async function loadForms({
    token,
    pagination,
    sort,
    tags,
    filters,
}: {
    token: string;
    pagination: {
        limit: number;
        offset: number;
    };
    sort?: {
        field: keyof Form;
        order: "asc" | "desc";
    };
    filters?: {
        fieldPath: string;
        operation: "contains";
        comparedValue: string;
    }[];
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

    if (filters !== undefined) {
        for (const filter of filters) {
            url.searchParams.set(
                `${filter.fieldPath}__regex`,
                `/${filter.comparedValue}/i`
            );
        }
    }

    // https://apidocs.form.io/#cd97fc97-7a86-aa65-8e5a-3e9e6eb4a22d
    if (tags) url.searchParams.set("tags__in", tags.join(","));

    const response = await safeFetch(url.toString(), {
        headers: {
            "x-jwt-token": token,
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
 * @param token - JWT token for formio.
 * @returns Updated form.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function updateForm(
    formSchema: Form,
    token: string
): Promise<Form> {
    const response = await safeFetch(
        `${getFormioUrl()}/form/${formSchema._id}`,
        {
            headers: {
                "Content-Type": "application/json",
                "x-jwt-token": token,
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
 * @param token - JWT token for formio.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function createAction<TSettings>(
    formId: string,
    action: Action<TSettings>,
    token: string
): Promise<Action<TSettings>> {
    const response = await safeFetch(
        `${getFormioUrl()}/form/${formId}/action`,
        {
            headers: {
                "Content-Type": "application/json",
                "x-jwt-token": token,
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
 * @param token - JWT token for formio.
 * @returns Submission or null if the returned status is 404.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function loadSubmission(
    formPath: string,
    submissionId: string,
    token: string
): Promise<Submission | null> {
    let response: Response;
    try {
        response = await safeFetch(
            `${getFormioUrl()}/${formPath}/submission/${submissionId}`,
            {
                headers: {
                    "x-jwt-token": token,
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
 * @param root0 - Options for loading submissions.
 * @param root0.token - JWT token for formio.
 * @param root0.pagination - Pagination settings.
 * @param root0.pagination.limit - Maximum number of submissions to load.
 * @param root0.pagination.offset - Offset of the first submission to load.
 * @param root0.sort - Sorting settings.
 * @param root0.sort.field - Field to sort by.
 * @param root0.sort.order - Order to sort by. (ascending or descending).
 * @param root0.filters - List of filters to apply.
 * @returns List of submissions.
 * @throws {RequestError} If the http request fails.
 * @throws {TypeError} If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 * @throws {Error} If the Content-Range header is invalid or unknown.
 */
export async function loadSubmissions(
    formId: string,
    {
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
        sort?: { field: string; order: "asc" | "desc" };
        filters?: {
            fieldPath: string;
            operation: "contains";
            comparedValue: string;
        }[];
    }
): Promise<{ data: Submission[]; totalCount: number }> {
    const url = new URL(`${getFormioUrl()}/form/${formId}/submission`);
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

    console.log("Fetching submissions of form...", {
        formId,
    });
    const response = await safeFetch(url, {
        headers: {
            "x-jwt-token": token,
        },
    });
    console.debug("Submissions of form fetched.", {
        formId,
    });
    const totalCount = Number(
        response.headers.get("Content-Range")?.match(/\d+$/)
    );
    if (isNaN(totalCount)) throw new Error("Invalid Content-Range header.");

    return { data: (await response.json()) as Submission[], totalCount };
}

/**
 * Update submission in the form management system.
 * @param formPath - Path of the form of which to update the submission.
 * @param updatedSubmission - Updated submission (used to replace submission with the same _id).
 * @param token - JWT token for formio.
 * @returns Updated submission.
 * @throws {RequestError}
 * If the http request fails.
 * @throws {TypeError}
 * If the response is not valid json or when a network error is encountered or CORS is misconfigured on the server-side.
 */
export async function updateSubmission(
    formPath: string,
    updatedSubmission: Partial<Submission> & Pick<Submission, "data" | "_id">,
    token: string
): Promise<Submission> {
    const response = await safeFetch(
        `${getFormioUrl()}${formPath}/submission/${updatedSubmission._id}`,
        {
            headers: {
                "x-jwt-token": token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedSubmission),
            method: "PUT",
        }
    );
    return (await response.json()) as Submission;
}
