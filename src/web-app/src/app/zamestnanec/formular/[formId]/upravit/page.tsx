import { Metadata } from "next";
import ClientEditFormPage from "./ClientEditFormPage";

export const metadata: Metadata = {
    title: "Upravit formulář",
};

/**
 * Page for editing a form.
 * @param root0 - Props for the component.
 * @param root0.params - Params from the URL.
 * @param root0.params.formId - ID of the form to edit.
 */
export default function EditFormPage({
    params,
}: {
    params: { formId: string };
}) {
    return <ClientEditFormPage formId={params.formId} />;
}
