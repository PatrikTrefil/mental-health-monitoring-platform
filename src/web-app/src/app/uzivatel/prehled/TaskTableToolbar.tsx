import TableViewOptions from "@/app/zamestnanec/sprava-ukolu/toolbar-items/TableViewOptionsToolbarItem";
import FilterToolbarItem from "@/components/FilterToolbarItem";
import { Table } from "@tanstack/react-table";

/**
 * Table toolbar for the user task table.
 * @param root0 - Props for the component.
 * @param root0.table - Reference to the table for which the toolbar is rendered.
 * @param root0.filterColumnId - ID of the column that is used for filtering.
 */
export default function TaskTableToolbar<TTable>({
    table,
    filterColumnId,
}: {
    table: Table<TTable>;
    filterColumnId: string;
}) {
    return (
        <div className="d-flex gap-2">
            <div style={{ maxWidth: "200px" }}>
                <FilterToolbarItem
                    table={table}
                    filterColumnId={filterColumnId}
                    placeholder="Filtrovat úkoly"
                />
            </div>
            <TableViewOptions style={{ marginLeft: "auto" }} table={table} />
        </div>
    );
}
