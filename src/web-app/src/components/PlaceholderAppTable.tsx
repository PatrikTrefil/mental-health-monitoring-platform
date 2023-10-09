"use client";

import { Table as TanstackTable, flexRender } from "@tanstack/react-table";
import { Table as BootstrapTable, Placeholder } from "react-bootstrap";

/**
 * Placeholder table for when the real table is loading.
 * @param root0 - Props for this component.
 * @param root0.table - Tanstack table for which the placeholder should be rendered.
 * @param root0.rowCount - Number of (placeholder) rows to render.
 */
export default function PlaceholderAppTable<TTableData>({
    table,
    rowCount,
}: {
    table: TanstackTable<TTableData>;
    rowCount: number;
}) {
    return (
        <BootstrapTable striped bordered>
            <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                      )}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {Array.from({ length: rowCount }).map((_, i) => (
                    <tr key={i}>
                        {table.getVisibleFlatColumns().map((_, i) => (
                            <td key={i}>
                                <Placeholder animation="wave">
                                    <Placeholder
                                        className="w-100"
                                        bg="secondary"
                                    />
                                </Placeholder>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </BootstrapTable>
    );
}
