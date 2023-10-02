"use client";

import FilterToolbarItem from "@/components/FilterToolbarItem";
import { Form as FormDefinition } from "@/types/formManagement/forms";
import { Table } from "@tanstack/react-table";
import CreateFormToolbarItem from "./toolbar-items/CreateFormToolbarItem";
import DeleteFormToolbarItem from "./toolbar-items/DeleteFormToolbarItem";

/**
 * Toolbar for the form table.
 * @param root0 - Props for this component.
 * @param root0.table - Table for which this toolbar is rendered.
 * @param root0.filterColumnId - Id of the column by which the table is filtered.
 */
export default function FormTableToolbar({
    table,
    filterColumnId,
}: {
    table: Table<FormDefinition>;
    filterColumnId: string;
}) {
    return (
        <div className="d-flex gap-2">
            <div style={{ maxWidth: "200px" }}>
                <FilterToolbarItem
                    table={table}
                    filterColumnId={filterColumnId}
                    placeholder="Filtrovat formuláře"
                />
            </div>
            <CreateFormToolbarItem />
            <DeleteFormToolbarItem table={table} />
        </div>
    );
}
