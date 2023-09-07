import UserRoleTitles from "@/constants/userRoleTitles";
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
 */
export default function EmployeeTableToolbar({
    table,
}: {
    table: Table<User>;
}) {
    const session = useSession();

    return (
        <div className="d-flex gap-2">
            {session?.data?.user.roleTitles.includes(
                UserRoleTitles.SPRAVCE_DOTAZNIKU
            ) && <CreateSpravceDotaznikuToolbarItem />}
            <CreateZadavatelDotaznikuToolbarItem />
            <DeleteEmployeeToolbarItem table={table} />
        </div>
    );
}
