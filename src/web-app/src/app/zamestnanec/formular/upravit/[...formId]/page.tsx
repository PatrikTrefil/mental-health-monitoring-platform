import { Metadata } from "next";
import ClientEditFormPage from "./ClientEditFormPage";

export const metadata: Metadata = {
    title: "Upravit formulář",
};

export default function EditFormPage({
    params,
}: {
    params: { formId: string };
}) {
    return <ClientEditFormPage formId={params.formId} />;
}
