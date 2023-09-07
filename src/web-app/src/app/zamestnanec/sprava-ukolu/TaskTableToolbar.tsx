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
 */
export default function TaskTableToolbar({
    table,
}: {
    table: Table<inferProcedureOutput<AppRouter["task"]["createTask"]>>;
}) {
    return (
        <div className="d-flex gap-2">
            <TaskCreationToolbarItem />
            <DeleteTodoToolbarItem table={table} />
            <TableViewOptions style={{ marginLeft: "auto" }} table={table} />
        </div>
    );
}
