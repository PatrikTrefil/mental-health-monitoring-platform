import { Metadata } from "next";
import ResultTable from "./ResultTable";

export const metadata: Metadata = {
    title: "Výsledky formuláře",
};

/**
 * Page for showing results of a form.
 * @param root0 - Props for the component.
 * @param root0.params - Params from the URL.
 * @param root0.params.formId - ID of the form to show results for.
 */
export default function FormResultPage({
    params,
}: {
    params: { formId: string };
}) {
    return <ResultTable formId={params.formId} />;
}
