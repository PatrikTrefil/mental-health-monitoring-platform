"use client";

import useDebounce from "@/hooks/useDebounce";
import { Table } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";

/**
 * Toolbar item for filtering a table.
 * @param root0 - Props for the component.
 * @param root0.table - Table for which to render the toolbar item.
 * @param root0.filterColumnId - ID of the column to filter by.
 * @param root0.placeholder - Placeholder text for the filter input.
 */
export default function FilterToolbarItem<T>({
    table,
    filterColumnId,
    placeholder,
}: {
    table: Table<T>;
    filterColumnId: string;
    placeholder: string;
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
            placeholder={placeholder}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
        />
    );
}
