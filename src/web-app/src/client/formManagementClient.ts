import { Action } from "@/types/action";
import { Form, FormSchema } from "@/types/forms";
import { Submission } from "@/types/submission";
import axios from "axios";
import getFormioUrl from "./formioUrl";
import { RequestError } from "./requestError";

/**
 * Load form with given path from formio.
 * @param relativeFormPath relative path to the form (including leading slash)
 * @param token JWT token for formio
 * @returns form with given path or null if not found
 * @throws {RequestError} if http request fails
 */
export async function loadFormByPath(
    relativeFormPath: string,
    token: string
): Promise<Form | null> {
    let form: Form;
    try {
        const { data } = await axios.get<unknown>(
            `${getFormioUrl()}${relativeFormPath}`,
            {
                headers: {
                    "x-jwt-token": token,
                },
            }
        );
        form = data as Form;
    } catch (e) {
        if (axios.isAxiosError(e)) {
            if (e.status === 404) return null;
            throw new RequestError("Failed to load form by path", e.status);
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
 */
export async function loadFormById(
    formId: string,
    token: string
): Promise<Form | null> {
    let form: Form;
    try {
        const { data } = await axios.get<unknown>(
            `${getFormioUrl()}/form/${formId}`,
            {
                headers: {
                    "x-jwt-token": token,
                },
            }
        );
        form = data as Form;
    } catch (e) {
        if (axios.isAxiosError(e)) {
            if (e.status === 404) return null;
            throw new RequestError("Failed to load form by id", e.status);
        }
        throw new Error("Unexpected error caught", { cause: e });
    }

    return form;
}

/**
 * Submit form to formio.
 * @param formioToken JWT token for formio
 * @param formSchema schema of the form to submit
 * @throws {RequestError} if the http request fails
 * @returns created form
 */
export async function createForm(
    formioToken: string,
    formSchema: FormSchema
): Promise<Form> {
    let form: Form;
    try {
        const { data } = await axios.post<unknown>(
            `${getFormioUrl()}/form`,
            formSchema,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-jwt-token": formioToken,
                },
            }
        );
        form = data as Form;
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to create form", e.status);
        throw new Error("Unexpected error caught", { cause: e });
    }

    return form;
}

/**
 * Make a submission to a formio form.
 * @param formioToken JWT token for formio
 * @param formPath path of the form to submit to (including leading slash)
 * @param submissionData submission data
 * @return created submission
 * @throws {RequestError} if the http request fails
 */
export async function submitForm(
    formioToken: string,
    formPath: string,
    submissionData: unknown
): Promise<Submission> {
    let createdSubmission: Submission;
    try {
        const { data } = await axios.post<unknown>(
            `${getFormioUrl()}${formPath}`,
            submissionData,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-jwt-token": formioToken,
                },
            }
        );
        createdSubmission = data as Submission;
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to submit form", e.status);
        throw new Error("Unexpected error caught", { cause: e });
    }

    return createdSubmission;
}

/**
 * Export form submissions from formio.
 * @param formioToken JWT token for formio
 * @param formId id of the form to export
 * @param format format of the exported data
 * @returns blob with exported data in given format
 * @throws {RequestError} if the http request fails
 */
export async function exportFormSubmissions(
    formioToken: string,
    formId: string,
    format: "csv" | "json"
): Promise<Blob> {
    try {
        const { data } = await axios.get<Blob>(
            `${getFormioUrl()}/form/${formId}/export?format=${format}`,
            {
                headers: {
                    "x-jwt-token": formioToken,
                },
                responseType: "blob",
            }
        );
        return data;
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError(
                "Failed to export form submissions",
                e.status
            );
        throw new Error("Unexpected error caught", { cause: e });
    }
}

/**
 * Delete form from the form management system.
 * @param formioToken JWT token for formio
 * @param formPath path of the form to delete
 * @throws {RequestError} if the http request fails
 */
export async function deleteForm(
    formioToken: string,
    formPath: string
): Promise<void> {
    try {
        await axios.delete(`${getFormioUrl()}${formPath}`, {
            headers: {
                "x-jwt-token": formioToken,
            },
        });
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to delete form", e.status);
        throw new Error("Unexpected error caught", { cause: e });
    }
}

/**
 * Load forms from the form management system.
 * @param formioToken JWT token for formio
 * @param tags list of tags which must be present on the form
 * @return list of forms
 * @throws {RequestError} if the http request fails
 */
export async function loadForms(
    formioToken: string,
    tags: string[]
): Promise<Form[]> {
    const url = new URL(`${getFormioUrl()}/form/`);

    url.searchParams.set("type", "form");
    // https://apidocs.form.io/#cd97fc97-7a86-aa65-8e5a-3e9e6eb4a22d
    url.searchParams.set("tags__in", tags.join(","));

    try {
        const { data } = await axios.get<unknown>(url.toString(), {
            headers: {
                "x-jwt-token": formioToken,
            },
        });
        return data as Form[];
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to load forms", e.status);
        throw new Error("Unexpected error caught", { cause: e });
    }
}

/**
 * Update form in the form management system.
 * @param formSchema Form schema to save to server
 * @throws {RequestError} if the http request fails
 * @returns updated form
 */
export async function updateForm(
    formSchema: Form,
    formioToken: string
): Promise<Form> {
    try {
        const { data } = await axios.put<unknown>(
            `${getFormioUrl()}/form/${formSchema._id}`,
            formSchema,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-jwt-token": formioToken,
                },
            }
        );
        return data as Form;
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to update form", e.status);
        throw new Error("Unexpected error caught", { cause: e });
    }
}

/**
 * Create action attached to a form in formio.
 * @param formId id of the form to create action for
 * @param action definition of the action to create
 * @param formioToken JWT token for formio
 * @throws {RequestError} if the http request fails
 */
export async function createAction<TSettings>(
    formId: string,
    action: Action<TSettings>,
    formioToken: string
): Promise<Action<TSettings>> {
    try {
        const { data } = await axios.post<unknown>(
            `${getFormioUrl()}/form/${formId}/action`,
            action,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-jwt-token": formioToken,
                },
            }
        );
        return data as Action<TSettings>;
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to create action", e.status);
        throw new Error("Unexpected error caught", { cause: e });
    }
}

/**
 * Load submissions from formio.
 * @param formPath path of the form to load submissions from
 * @param submissionId id of the submission to load
 * @param formioToken JWT token for formio
 * @throws {RequestError} if the http request fails
 */
export async function loadSubmission(
    formPath: string,
    submissionId: string,
    formioToken: string
) {
    try {
        const { data } = await axios.get<unknown>(
            `${getFormioUrl()}/${formPath}/submission/${submissionId}`,
            {
                headers: {
                    "x-jwt-token": formioToken,
                    "Content-Type": "application/json",
                },
            }
        );
        return data as Submission;
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to load submission", e.status);
        throw new Error("Unexpected error caught", { cause: e });
    }
}

/**
 * Get submissions of a form
 * @param formId id of the form to load submissions from
 * @param formioToken JWT token for formio
 * @returns list of submissions
 * @throws {RequestError} if the http request fails
 */
export async function loadSubmissions(
    formId: string,
    formioToken: string
): Promise<Submission[]> {
    console.log("Fetching submissions of form...", {
        formId,
    });
    try {
        const { data } = await axios.get<unknown>(
            `${getFormioUrl()}/${formId}/submission`,
            {
                headers: {
                    "x-jwt-token": formioToken,
                },
            }
        );
        console.log("Submissions of form fetched.", {
            formId,
        });
        return data as Submission[];
    } catch (e) {
        console.log("Fetch of submissions of form failed.", {
            formId,
        });
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to load submissions", e.status);
        throw new Error("Unexpected error caught", { cause: e });
    }
}

/**
 * Update submission in the form management system
 * @param formPath path of the form of which to update the submission
 * @param submissionId id of the submission to update
 * @param data data to update the submission with
 * @param formioToken JWT token for formio
 * @returns updated submission
 * @throws {RequestError} if the http request fails
 */
export async function updateSubmission(
    formPath: string,
    submissionId: string,
    data: unknown,
    formioToken: string
): Promise<Submission> {
    try {
        const { data: response } = await axios.put<unknown>(
            `${getFormioUrl()}/${formPath}/submission/${submissionId}`,
            JSON.stringify({
                _id: submissionId,
                data,
            }),
            {
                headers: {
                    "x-jwt-token": formioToken,
                    "Content-Type": "application/json",
                },
            }
        );
        return response as Submission;
    } catch (e) {
        if (axios.isAxiosError(e))
            throw new RequestError("Failed to update submission", e.status);
        throw new Error("Unexpected error caught", { cause: e });
    }
}
