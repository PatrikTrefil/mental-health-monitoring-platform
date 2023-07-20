import { Metadata } from "next";
import ClientPreviewFormPage from "./ClientPreviewFormPage";

export const metadata: Metadata = {
    title: "Náhled formuláře",
};

export default function PreviewFormPage({
    params,
}: {
    params: { formId: string };
}) {
    return <ClientPreviewFormPage formId={params.formId} />;
}
