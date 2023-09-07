"use client";

import { Table } from "@tanstack/react-table";
import { Dropdown, Form } from "react-bootstrap";

/**
 * Renders a dropdown with view options for the table.
 * @param root0 - Props for the component.
 * @param root0.table - Table for which to render options.
 * @param root0.style - Style for the dropdown container.
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
                        return (
                            <Dropdown.ItemText key={column.id}>
                                <Form.Check
                                    // render header as label
                                    label={column.id}
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
