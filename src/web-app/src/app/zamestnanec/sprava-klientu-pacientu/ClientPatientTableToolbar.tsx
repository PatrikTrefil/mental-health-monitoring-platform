import { User } from "@/types/userManagement/user";
import { Table } from "@tanstack/react-table";
import CreateClientPatientToolbarItem from "./toolbar-items/CreateClientPatientToolbarItem";
import DeleteClientPatientToolbarItem from "./toolbar-items/DeleteClientPatientToolbarItem";

/**
 * Toolbar for the table of clients and patients.
 * @param root0 - Props for the component.
 * @param root0.table - Table for which to render the toolbar.
 */
export default function ClientPatientTableToolbar({
    table,
}: {
    table: Table<User>;
}) {
    return (
        <div className="d-flex gap-2">
            <CreateClientPatientToolbarItem />
            <DeleteClientPatientToolbarItem table={table} />
        </div>
    );
}
