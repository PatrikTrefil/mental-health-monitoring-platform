import ExportButton from "@/app/zamestnanec/sprava-formularu/ExportButton";

/**
 * Toolbar item for exporting the results of a form.
 * @param root0 - Props for this component.
 * @param root0.formId - ID of the form for which to export the results.
 */
export default function ExportButtonToolbarItem({
    formId,
}: {
    formId: string;
}) {
    return <ExportButton formId={formId} />;
}
