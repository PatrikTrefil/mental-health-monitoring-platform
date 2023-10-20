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
 * @param root0.filterProps - Props for the filter toolbar item.
 * @param root0.filterProps.columnId - ID of the column that is used for filtering.
 * @param root0.filterProps.placeholder - Placeholder for the filter input.
 */
export default function TaskTableToolbar({
    table,
    filterProps: { columnId, placeholder },
}: {
    table: Table<inferProcedureOutput<AppRouter["task"]["createTask"]>>;
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
                    placeholder={placeholder}
                />
            </div>
            <TaskCreationToolbarItem />
            <DeleteTodoToolbarItem table={table} />
            <TableViewOptions style={{ marginLeft: "auto" }} table={table} />
        </div>
    );
}
