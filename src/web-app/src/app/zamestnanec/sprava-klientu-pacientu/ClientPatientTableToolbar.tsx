import { User } from "@/types/userManagement/user";
import { Table } from "@tanstack/react-table";
import CreateClientPatientToolbarItem from "./toolbar-items/CreateClientPatientToolbarItem";
import DeleteClientPatientToolbarItem from "./toolbar-items/DeleteClientPatientToolbarItem";
import FilterClientPatientToolbarItem from "./toolbar-items/FilterClientPatientToolbarItem";

/**
 * Toolbar for the table of clients and patients.
 * @param root0 - Props for the component.
 * @param root0.table - Table for which to render the toolbar.
 * @param root0.filterColumnId - ID of the column to filter by (passed down to a filter toolbar item).
 */
export default function ClientPatientTableToolbar({
    table,
    filterColumnId,
}: {
    table: Table<User>;
    filterColumnId: string;
}) {
    return (
        <div className="d-flex gap-2 flex-wrap">
            <div style={{ maxWidth: "200px" }}>
                <FilterClientPatientToolbarItem
                    table={table}
                    filterColumnId={filterColumnId}
                />
            </div>
            <CreateClientPatientToolbarItem />
            <DeleteClientPatientToolbarItem table={table} />
        </div>
    );
}
