import { Form } from "@/types/form";
import { UserFormSubmission } from "@/types/userFormSubmission";

/**
 * Load form with given id from formio.
 * @param formId id of the form to load
 * @param token JWT token for formio
 * @returns form with given id or null if not found
 */
export async function loadForm(
    formId: string,
    token: string
): Promise<Form | null> {
    const response = await fetch(
        `${process.env.FORMIO_SERVER_URL}/form/${formId}`,
        {
            headers: {
                "x-jwt-token": token,
            },
        }
    );
    if (response.status === 404) return null;

    return (await response.json()) as Form;
}

export async function loadUsers(formioToken: string) {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}klientpacient/submission`,
        {
            headers: {
                "x-jwt-token": formioToken,
            },
        }
    );

    return (await response.json()) as UserFormSubmission[];
}
