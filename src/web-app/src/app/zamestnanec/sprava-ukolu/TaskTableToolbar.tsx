import FilterToolbarItem from "@/components/FilterToolbarItem";
import { AppRouter } from "@/server/routers/root";
import { Table } from "@tanstack/react-table";
import type { inferProcedureOutput } from "@trpc/server";
import DeleteTodoToolbarItem from "./toolbar-items/DeleteTodoToolbarItem";
import TableViewOptions from "./toolbar-items/TableViewOptionsToolbarItem";
import TaskCreationToolbarItem from "./toolbar-items/TaskCreationToolbarItem";

/**
 * Renders a toolbar for the task table.
 * @param root0 - Props for the component.
 * @param root0.table - Reference to the table for which the toolbar is rendered.
 * @param root0.filterColumnId - ID of the column that is used for filtering.
 */
export default function TaskTableToolbar({
    table,
    filterColumnId,
}: {
    table: Table<inferProcedureOutput<AppRouter["task"]["createTask"]>>;
    filterColumnId: string;
}) {
    return (
        <div className="d-flex gap-2">
            <div style={{ maxWidth: "200px" }}>
                <FilterToolbarItem
                    table={table}
                    filterColumnId={filterColumnId}
                    placeholder="Filtrovat klienty/pacienty"
                />
            </div>
            <TaskCreationToolbarItem />
            <DeleteTodoToolbarItem table={table} />
            <TableViewOptions style={{ marginLeft: "auto" }} table={table} />
        </div>
    );
}
