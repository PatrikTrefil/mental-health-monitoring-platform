"use client";

import { Table } from "@tanstack/react-table";
import { useEffect } from "react";
import { Dropdown, Form } from "react-bootstrap";
import { z } from "zod";

const stateValidationSchema = z.record(z.string(), z.boolean());

/**
 * Renders a dropdown with view options for the table.
 * @param root0 - Props for the component.
 * @param root0.table - Table for which to render options. It is expected that
 * each column has a meta property `viewOptionsLabel` of type string that is displayed by this component.
 * @param root0.style - Style for the dropdown container.
 * @param root0.localStorageKey - Key under which to store the visibility state in local storage. Keys in camel case are recommended.
 * @throws {Error} If any column in the table does not have a label.
 */
export default function TableViewOptions<TData>({
    table,
    style,
    localStorageKey,
}: {
    table: Table<TData>;
    style?: React.CSSProperties;
    localStorageKey: string;
}) {
    useEffect(
        function loadVisibilityStateFromLocalStorage() {
            const unparsedInitialState = localStorage.getItem(localStorageKey);
            if (unparsedInitialState === null) return;
            const initialState = stateValidationSchema.safeParse(
                JSON.parse(unparsedInitialState)
            );
            if (initialState.success) {
                console.info(
                    "Found initial visibility state in local storage",
                    {
                        initialState,
                        localStorageKey,
                    }
                );
                table.setColumnVisibility((prev) => {
                    for (const [colId, visibility] of Object.entries(
                        initialState.data
                    )) {
                        prev[colId] = visibility;
                    }
                    return prev;
                });
            } else {
                console.error(
                    `Invalid state in local storage for table view options. Resetting to empty object.`,
                    { error: initialState.error, localStorageKey }
                );
                localStorage.setItem(localStorageKey, "{}");
            }
        },
        [localStorageKey, table]
    );

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
                                    onChange={(e) => {
                                        if (column.id === undefined)
                                            throw new Error(
                                                `Column ${column.id} does not have an ID.`
                                            );

                                        const unparsedState =
                                            localStorage.getItem(
                                                localStorageKey
                                            );
                                        const parsedStateResult =
                                            unparsedState === null
                                                ? stateValidationSchema.safeParse(
                                                      {}
                                                  )
                                                : stateValidationSchema.safeParse(
                                                      JSON.parse(unparsedState)
                                                  );

                                        if (!parsedStateResult.success)
                                            console.error(
                                                "Invalid state in local storage for table view options: ",
                                                {
                                                    e: parsedStateResult.error,
                                                    localStorageKey,
                                                }
                                            );

                                        const parsedState =
                                            parsedStateResult.success
                                                ? parsedStateResult.data
                                                : {};
                                        parsedState[column.id] =
                                            e.target.checked;
                                        console.debug(
                                            "Saving visibility state to local storage",
                                            {
                                                localStorageKey,
                                                newState: parsedState,
                                            }
                                        );
                                        localStorage.setItem(
                                            localStorageKey,
                                            JSON.stringify(parsedState)
                                        );
                                        column.toggleVisibility(
                                            e.target.checked
                                        );
                                    }}
                                />
                            </Dropdown.ItemText>
                        );
                    })}
            </Dropdown.Menu>
        </Dropdown>
    );
}
