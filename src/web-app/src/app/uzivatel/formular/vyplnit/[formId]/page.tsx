import { Metadata } from "next";
import FillOutForm from "./FillOutForm";

export const metadata: Metadata = {
    title: "Vyplnit formulář",
};

export default function FillOutFormPage({
    params,
}: {
    params: { formId: string };
}) {
    return <FillOutForm formId={params.formId} />;
}
