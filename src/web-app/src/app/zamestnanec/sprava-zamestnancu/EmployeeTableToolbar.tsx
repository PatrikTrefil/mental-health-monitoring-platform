import FilterToolbarItem from "@/components/FilterToolbarItem";
import UserRoleTitles from "@/constants/userRoleTitles";
import { UserRoleTitle } from "@/types/userManagement/UserRoleTitle";
import { User } from "@/types/userManagement/user";
import { Table } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import CreateSpravceDotaznikuToolbarItem from "./toolbar-items/CreateSpravceDotaznikuToolbarItem";
import CreateZadavatelDotaznikuToolbarItem from "./toolbar-items/CreateZadavatelDotaznikuToolbarItem";
import DeleteEmployeeToolbarItem from "./toolbar-items/DeleteEmployeeToolbarItem";

/**
 * Toolbar for the employee table.
 * @param root0 - Props for the component.
 * @param root0.table - Table for which the toolbar is rendered.
 * @param root0.filterColumnId - Id of the column by which the table is filtered.
 */
export default function EmployeeTableToolbar({
    table,
    filterColumnId,
}: {
    table: Table<User & { mainUserRoleTitle: UserRoleTitle }>;
    filterColumnId: string;
}) {
    const session = useSession();

    return (
        <div className="d-flex gap-2">
            <div style={{ maxWidth: "200px" }}>
                <FilterToolbarItem
                    table={table}
                    filterColumnId={filterColumnId}
                    placeholder="Filtrovat zaměstnance"
                />
            </div>
            {session?.data?.user.roleTitles.includes(
                UserRoleTitles.SPRAVCE_DOTAZNIKU
            ) && <CreateSpravceDotaznikuToolbarItem />}
            <CreateZadavatelDotaznikuToolbarItem />
            <DeleteEmployeeToolbarItem table={table} />
        </div>
    );
}
