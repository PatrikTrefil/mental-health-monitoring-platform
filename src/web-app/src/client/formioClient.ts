import { Form } from "@/types/form";

export async function loadForm(formId: string, token: string): Promise<Form> {
    const response = await fetch(
        `${process.env.FORMIO_SERVER_URL}/form/${formId}`,
        {
            headers: {
                "x-jwt-token": token,
            },
        }
    );
    return (await response.json()) as Form;
}
