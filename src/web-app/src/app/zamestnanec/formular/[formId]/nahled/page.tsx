import { Metadata } from "next";
import ClientPreviewFormPage from "./ClientPreviewFormPage";

export const metadata: Metadata = {
    title: "Náhled formuláře",
};

/**
 * Preview form page.
 * @param root0 - Props for the component.
 * @param root0.params - Params from the URL.
 * @param root0.params.formId - ID of the form to preview.
 */
export default function PreviewFormPage({
    params,
}: {
    params: { formId: string };
}) {
    return <ClientPreviewFormPage formId={params.formId} />;
}
