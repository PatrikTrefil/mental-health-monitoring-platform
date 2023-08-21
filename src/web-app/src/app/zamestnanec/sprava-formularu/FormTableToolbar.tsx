"use client";

import { Table } from "@tanstack/react-table";
import CreateFormToolbarItem from "./toolbar-items/CreateFormToolbarItem";

/**
 * Toolbar for the form table.
 * @param root0 - Props for this component.
 * @param root0.table - Table for which this toolbar is rendered.
 */
export default function FormTableToolbar<TData>({ table }: { table: Table<TData> }) {
    return <CreateFormToolbarItem />;
}
