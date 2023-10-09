"use client";

import { Table as TanstackTable, flexRender } from "@tanstack/react-table";
import { Table as BootstrapTable } from "react-bootstrap";

/**
 * Turn a Tanstack table into a concrete markup styled with Bootstrap.
 * @param root0 - Props for this component.
 * @param root0.table - The Tanstack table to render.
 */
export default function AppTable<TTableData>({
    table,
}: {
    table: TanstackTable<TTableData>;
}) {
    return (
        <BootstrapTable
            striped
            bordered
            hover
            responsive
            className="text-nowrap"
        >
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
                {table.getRowModel().rows.length === 0 ? (
                    <tr>
                        <td
                            colSpan={table.getVisibleFlatColumns().length}
                            className="text-center align-middle"
                        >
                            Žádná data
                        </td>
                    </tr>
                ) : (
                    table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className="align-middle"
                                    style={{
                                        width:
                                            typeof cell.column.columnDef
                                                .meta === "object" &&
                                            "isNarrow" in
                                                cell.column.columnDef.meta &&
                                            cell.column.columnDef.meta?.isNarrow
                                                ? "0"
                                                : undefined,
                                    }}
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </BootstrapTable>
    );
}
