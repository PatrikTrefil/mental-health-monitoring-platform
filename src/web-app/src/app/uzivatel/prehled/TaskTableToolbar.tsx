import TableViewOptions from "@/app/zamestnanec/sprava-ukolu/toolbar-items/TableViewOptionsToolbarItem";
import FilterToolbarItem from "@/components/FilterToolbarItem";
import { Table } from "@tanstack/react-table";

/**
 * Table toolbar for the user task table.
 * @param root0 - Props for the component.
 * @param root0.table - Reference to the table for which the toolbar is rendered.
 * @param root0.filterProps - Props for the filter toolbar item.
 * @param root0.filterProps.columnId - ID of the column that is used for filtering.
 * @param root0.filterProps.placeholder - Placeholder for the filter input.
 */
export default function TaskTableToolbar<TTable>({
    table,
    filterProps: { columnId: columnId, placeholder: filterPlaceholder },
}: {
    table: Table<TTable>;
    filterProps: {
        columnId: string;
        placeholder: string;
    };
}) {
    return (
        <div className="d-flex gap-2">
            <div style={{ maxWidth: "225px" }}>
                <FilterToolbarItem
                    table={table}
                    filterColumnId={columnId}
                    placeholder={filterPlaceholder}
                />
            </div>
            <TableViewOptions style={{ marginLeft: "auto" }} table={table} />
        </div>
    );
}
