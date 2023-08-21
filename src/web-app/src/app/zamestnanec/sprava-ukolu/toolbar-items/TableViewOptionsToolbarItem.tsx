"use client";

import { Table, flexRender } from "@tanstack/react-table";
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
                {table.getHeaderGroups().flatMap((g) =>
                    g.headers.map((h) => {
                        return (
                            <Dropdown.ItemText key={h.id}>
                                <Form.Check
                                    // render header as label
                                    label={flexRender(
                                        h.column.columnDef.header,
                                        h.getContext()
                                    )}
                                    checked={h.column.getIsVisible()}
                                    onChange={(e) =>
                                        h.column.toggleVisibility(
                                            !!e.target.checked
                                        )
                                    }
                                />
                            </Dropdown.ItemText>
                        );
                    })
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
}
