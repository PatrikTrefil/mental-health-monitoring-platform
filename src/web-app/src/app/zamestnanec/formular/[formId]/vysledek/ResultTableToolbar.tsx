import TableViewOptions from "@/app/zamestnanec/sprava-ukolu/toolbar-items/TableViewOptionsToolbarItem";
import FilterToolbarItem from "@/components/FilterToolbarItem";
import { Table } from "@tanstack/react-table";
import FrequencyVisualization from "./FrequencyVisualization";

/**
 * Tollbar for the result table.
 * @param root0 - Props for this component.
 * @param root0.frequencyVisualizationProps - Props for the frequency visualization.
 * @param root0.table - Table for which to render the toolbar.
 * @param root0.filterProps - Props for the filter toolbar item.
 * @param root0.filterProps.pathLabelMap - Map of paths in the submission object to their labels (display names).
 * @param root0.filterProps.placeholder - Placeholder for the filter input.
 * @param root0.filterProps.columnId - ID of the column to filter by.
 */
export default function ResultTableToolbar<TTable>({
    frequencyVisualizationProps,
    table,
    filterProps: { columnId: filterColumnId, pathLabelMap, placeholder },
}: {
    frequencyVisualizationProps: Parameters<typeof FrequencyVisualization>[0];
    table: Table<TTable>;
    filterProps: {
        columnId: string;
        pathLabelMap: { [key: string]: string };
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
                    pathLabelMap={pathLabelMap}
                />
            </div>
            <FrequencyVisualization {...frequencyVisualizationProps} />
            <TableViewOptions style={{ marginLeft: "auto" }} table={table} />
        </div>
    );
}
