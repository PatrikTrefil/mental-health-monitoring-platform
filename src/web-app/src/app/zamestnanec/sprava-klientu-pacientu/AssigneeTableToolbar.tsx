import { User } from "@/types/userManagement/user";
import { Table } from "@tanstack/react-table";
import FilterToolbarItem from "../../../components/FilterToolbarItem";
import BatchDeleteAssigneeToolbarItem from "./toolbar-items/BatchDeleteAssigneeToolbarItem";
import CreateAssigneeToolbarItem from "./toolbar-items/CreateAssigneeToolbarItem";

/**
 * Toolbar for the table of assignees.
 * @param root0 - Props for the component.
 * @param root0.table - Table for which to render the toolbar.
 * @param root0.filterProps - Props for the filter toolbar item.
 * @param root0.filterProps.placeholder - Placeholder for the filter input (passed down to a filter toolbar item).
 * @param root0.filterProps.columnId - ID of the column to filter by (passed down to a filter toolbar item).
 */
export default function AssigneeTableToolbar({
    table,
    filterProps: { columnId, placeholder },
}: {
    table: Table<User>;
    filterProps: {
        columnId: string;
        placeholder: string;
    };
}) {
    return (
        <div className="d-flex gap-2 flex-wrap">
            <div style={{ maxWidth: "225px" }}>
                <FilterToolbarItem
                    table={table}
                    filterColumnId={columnId}
                    placeholder={placeholder}
                />
            </div>
            <CreateAssigneeToolbarItem />
            <BatchDeleteAssigneeToolbarItem table={table} />
        </div>
    );
}
