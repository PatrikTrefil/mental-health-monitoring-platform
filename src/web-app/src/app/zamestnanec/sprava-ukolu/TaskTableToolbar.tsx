import { Table } from "@tanstack/react-table";
import TableViewOptions from "./toolbar-items/TableViewOptionsToolbarItem";
import TaskCreationToolbarItem from "./toolbar-items/TaskCreationToolbarItem";

/**
 * Renders a toolbar for the task table.
 * @param root0 - Props for the component.
 * @param root0.table - Reference to the table for which the toolbar is rendered.
 */
export default function TaskTableToolbar<TData>({
    table,
}: {
    table: Table<TData>;
}) {
    return (
        <div className="d-flex gap-2">
            <TaskCreationToolbarItem />
            <TableViewOptions style={{ marginLeft: "auto" }} table={table} />
        </div>
    );
}
