"use client";

import useDebounce from "@/hooks/useDebounce";
import { User } from "@/types/userManagement/user";
import { Table } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";

/**
 * Toolbar item for filtering the table of clients and patients.
 * @param root0 - Props for the component.
 * @param root0.table - Table for which to render the toolbar item.
 * @param root0.filterColumnId - ID of the column to filter by.
 */
export default function FilterClientPatientToolbarItem({
    table,
    filterColumnId,
}: {
    table: Table<User>;
    filterColumnId: string;
}) {
    const [filterValue, setFilterValue] = useState(
        () =>
            (table.getColumn(filterColumnId)?.getFilterValue() as string) ?? ""
    );
    const debouncedFilterValue = useDebounce(filterValue);

    useEffect(() => {
        table.getColumn(filterColumnId)?.setFilterValue(debouncedFilterValue);
    }, [table, debouncedFilterValue, filterColumnId]);

    return (
        <Form.Control
            type="text"
            placeholder="Filtrovat klienty/pacienty"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
        />
    );
}
