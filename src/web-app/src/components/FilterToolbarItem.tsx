"use client";

import {
    filterColumnIdUrlParamName,
    filterUrlParamName,
} from "@/constants/urlParamNames";
import useDebounce from "@/hooks/useDebounce";
import { Table } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Form, InputGroup } from "react-bootstrap";

/**
 * Toolbar item for filtering a table.
 * @param root0 - Props for the component.
 * @param root0.table - Table for which to render the toolbar item.
 * @param root0.filterColumnId - ID of the column to filter by.
 * @param root0.placeholder - Placeholder text for the filter input.
 * @param root0.multiColumn - Whether to allow filtering by multiple columns.
 * Every column which should be filterable must have a `filterLabel` property in its meta.
 * (a select element with column names will be shown).
 */
export default function FilterToolbarItem<T>({
    table,
    filterColumnId,
    placeholder,
    multiColumn,
}: {
    table: Table<T>;
    filterColumnId: string;
    placeholder: string;
    multiColumn?: boolean;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams()!;

    const columns = table.getAllColumns();
    const pathLabelMap = useMemo(
        () =>
            Object.fromEntries(
                columns
                    .filter((c) => (c.columnDef.meta as any)?.filterLabel) // Ignore columns without filterLabel
                    .map((c) => [c.id, (c.columnDef.meta as any).filterLabel])
            ),
        [columns]
    );

    const [filterValue, setFilterValue] = useState(
        () => searchParams.get(filterUrlParamName) ?? ""
    );
    const debouncedFilterValue = useDebounce(filterValue);

    useEffect(
        function filterTableAfterDebounce() {
            if (filterColumnId !== "")
                table
                    .getColumn(filterColumnId)
                    ?.setFilterValue(debouncedFilterValue);
        },
        [table, debouncedFilterValue, filterColumnId]
    );

    return (
        <div className="d-flex gap-1">
            <InputGroup>
                <InputGroup.Text>Filtr:</InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder={placeholder}
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                />
                {multiColumn && (
                    <>
                        <InputGroup.Text>Pro sloupec:</InputGroup.Text>
                        <Form.Select
                            value={filterColumnId}
                            onChange={(e) => {
                                const newParams = new URLSearchParams(
                                    searchParams.toString()
                                );
                                newParams.set(
                                    filterColumnIdUrlParamName,
                                    e.target.value
                                );
                                router.replace(
                                    pathname + "?" + newParams.toString()
                                );
                            }}
                            isInvalid={
                                filterValue !== "" &&
                                (filterColumnId === "" ||
                                    pathLabelMap[filterColumnId] === undefined)
                            }
                        >
                            <option value="">Vyberte sloupec</option>
                            {Object.entries(pathLabelMap).map(
                                ([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                )
                            )}
                        </Form.Select>
                    </>
                )}
            </InputGroup>
        </div>
    );
}
