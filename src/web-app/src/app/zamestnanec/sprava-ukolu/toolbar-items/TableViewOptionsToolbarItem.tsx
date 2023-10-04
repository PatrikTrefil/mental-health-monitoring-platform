"use client";

import { Table } from "@tanstack/react-table";
import { Dropdown, Form } from "react-bootstrap";

/**
 * Renders a dropdown with view options for the table.
 * @param root0 - Props for the component.
 * @param root0.table - Table for which to render options.
 * @param root0.style - Style for the dropdown container.
 * @throws {Error} If any column in the table does not have a label.
 */
export default function TableViewOptions<TData>({
    table,
    style,
}: {
    table: Table<TData>;
    style?: React.CSSProperties;
}) {
    return (
        <Dropdown style={style}>
            <Dropdown.Toggle variant="secondary">
                <i
                    className="bi bi-sliders"
                    style={{ paddingRight: "5px" }}
                ></i>
                Zobrazení
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {table
                    .getAllColumns()
                    .filter((h) => h.id !== "select") // the select column is not toggleable
                    .map((column) => {
                        const meta = column.columnDef.meta;
                        if (
                            meta === undefined ||
                            !("viewOptionsLabel" in meta) ||
                            typeof meta.viewOptionsLabel !== "string"
                        )
                            throw new Error(
                                `Column ${column.id} does not have a label.`
                            );

                        return (
                            <Dropdown.ItemText key={column.id}>
                                <Form.Check
                                    label={meta.viewOptionsLabel}
                                    checked={column.getIsVisible()}
                                    onChange={(e) =>
                                        column.toggleVisibility(
                                            !!e.target.checked
                                        )
                                    }
                                />
                            </Dropdown.ItemText>
                        );
                    })}
            </Dropdown.Menu>
        </Dropdown>
    );
}
