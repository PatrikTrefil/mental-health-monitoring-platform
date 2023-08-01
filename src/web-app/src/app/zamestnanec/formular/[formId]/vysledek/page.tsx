import { Metadata } from "next";
import ResultTable from "./ResultTable";

export const metadata: Metadata = {
    title: "Výsledky formuláře",
};

export default function FormResultPage({
    params,
}: {
    params: { formId: string };
}) {
    return <ResultTable formId={params.formId} />;
}
