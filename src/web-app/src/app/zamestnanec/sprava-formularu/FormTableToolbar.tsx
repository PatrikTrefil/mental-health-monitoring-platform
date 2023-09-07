"use client";

import { Form as FormDefinition } from "@/types/formManagement/forms";
import { Table } from "@tanstack/react-table";
import CreateFormToolbarItem from "./toolbar-items/CreateFormToolbarItem";
import DeleteFormToolbarItem from "./toolbar-items/DeleteFormToolbarItem";

/**
 * Toolbar for the form table.
 * @param root0 - Props for this component.
 * @param root0.table - Table for which this toolbar is rendered.
 */
export default function FormTableToolbar({
    table,
}: {
    table: Table<FormDefinition>;
}) {
    return (
        <div className="d-flex gap-2">
            <CreateFormToolbarItem />
            <DeleteFormToolbarItem table={table} />
        </div>
    );
}
