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
 * @param root0.filterProps - Props for the filter toolbar item.
 * @param root0.filterProps.placeholder - Placeholder for the filter input.
 * @param root0.filterProps.columnId - Id of the column by which the table is filtered.
 */
export default function FormTableToolbar({
    table,
    filterProps: { columnId, placeholder },
}: {
    table: Table<FormDefinition>;
    filterProps: {
        columnId: string;
        placeholder: string;
    };
}) {
    return (
        <div className="d-flex gap-2">
            <div style={{ maxWidth: "225px" }}>
                <FilterToolbarItem
                    table={table}
                    filterColumnId={columnId}
                    placeholder={placeholder}
                />
            </div>
            <CreateFormToolbarItem />
            <DeleteFormToolbarItem table={table} />
        </div>
    );
}
