import FilterToolbarItem from "@/components/FilterToolbarItem";
import TableViewOptions from "@/components/TableViewOptionsToolbarItem";
import { Table } from "@tanstack/react-table";
import ExportButtonToolbarItem from "./toolbar-items/ExportButtonToolbarItem";
import FrequencyVisualizationToolbarItem from "./toolbar-items/FrequencyVisualizationToolbarItem";

/**
 * Tollbar for the result table.
 * @param root0 - Props for this component.
 * @param root0.frequencyVisualizationProps - Props for the frequency visualization.
 * @param root0.table - Table for which to render the toolbar.
 * @param root0.filterProps - Props for the filter toolbar item.
 * @param root0.filterProps.placeholder - Placeholder for the filter input.
 * @param root0.filterProps.columnId - ID of the column to filter by.
 * @param root0.formId - ID of the form for which the results are being displayed.
 * @param root0.filterProps.multiColumn - Whether to filter by multiple columns (a select element with column names will be shown).
 * Every column which should be filterable must have a `filterLabel` property in its meta.
 */
export default function ResultTableToolbar<TTable>({
    formId,
    frequencyVisualizationProps,
    table,
    filterProps: { columnId: filterColumnId, placeholder, multiColumn },
}: {
    formId: string;
    frequencyVisualizationProps: Parameters<
        typeof FrequencyVisualizationToolbarItem
    >[0];
    table: Table<TTable>;
    filterProps: {
        columnId: string;
        multiColumn?: boolean;
        placeholder: string;
    };
}) {
    return (
        <div className="d-flex gap-2 flex-wrap">
            <div className="d-flex" style={{ maxWidth: "500px" }}>
                <FilterToolbarItem
                    table={table}
                    filterColumnId={filterColumnId}
                    placeholder={placeholder}
                    multiColumn={multiColumn}
                />
            </div>
            <FrequencyVisualizationToolbarItem
                {...frequencyVisualizationProps}
            />
            <ExportButtonToolbarItem formId={formId} table={table} />
            <TableViewOptions
                style={{ marginLeft: "auto" }}
                table={table}
                localStorageKey={`resultTableViewOptions-${formId}`}
            />
        </div>
    );
}
