import { Metadata } from "next";
import FillOutForm from "./FillOutForm";

export const metadata: Metadata = {
    title: "Vyplnit formulář",
};

/**
 * Page for filling out a form.
 * @param root0 - Props for the component.
 * @param root0.params - Params from the URL.
 * @param root0.params.formId - ID of the form to fill out.
 */
export default function FillOutFormPage({
    params,
}: {
    params: { formId: string };
}) {
    return <FillOutForm formId={params.formId} />;
}
