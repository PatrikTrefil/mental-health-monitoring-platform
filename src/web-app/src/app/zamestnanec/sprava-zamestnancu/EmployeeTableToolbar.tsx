import FilterToolbarItem from "@/components/FilterToolbarItem";
import UserRoleTitles from "@/constants/userRoleTitles";
import { UserRoleTitle } from "@/types/userManagement/UserRoleTitle";
import { User } from "@/types/userManagement/user";
import { Table } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import CreateAssignerToolbarItem from "./toolbar-items/CreateAssignerToolbarItem";
import CreateFormManagerToolbarItem from "./toolbar-items/CreateFormManagerToolbarItem";
import DeleteEmployeeToolbarItem from "./toolbar-items/DeleteEmployeeToolbarItem";

/**
 * Toolbar for the employee table.
 * @param root0 - Props for the component.
 * @param root0.table - Table for which the toolbar is rendered.
 * @param root0.filterProps.columnId - Id of the column by which the table is filtered.
 * @param root0.filterProps.placeholder - Placeholder for the filter input.
 * @param root0.filterProps - Props for the filter toolbar item.
 */
export default function EmployeeTableToolbar({
    table,
    filterProps: { columnId, placeholder },
}: {
    table: Table<User & { mainUserRoleTitle: UserRoleTitle }>;
    filterProps: { columnId: string; placeholder: string };
}) {
    const session = useSession();

    return (
        <div className="d-flex gap-2">
            <div style={{ maxWidth: "225px" }}>
                <FilterToolbarItem
                    table={table}
                    filterColumnId={columnId}
                    placeholder={placeholder}
                />
            </div>
            {session?.data?.user.roleTitles.includes(
                UserRoleTitles.FORM_MANAGER
            ) && <CreateFormManagerToolbarItem />}
            <CreateAssignerToolbarItem />
            <DeleteEmployeeToolbarItem table={table} />
        </div>
    );
}
