import ExportButton from "@/app/zamestnanec/sprava-formularu/ExportButton";
import { Table } from "@tanstack/react-table";

/**
 * Toolbar item for exporting the results of a form.
 * @param root0 - Props for this component.
 * @param root0.formId - ID of the form for which to export the results.
 * @param root0.table - Table instance for which to export the results.
 * Used to retrieve information about the filters.
 */
export default function ExportButtonToolbarItem<TTable>({
    formId,
    table,
}: {
    formId: string;
    table: Table<TTable>;
}) {
    return <ExportButton formId={formId} table={table} />;
}
