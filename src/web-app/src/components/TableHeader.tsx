import { Column } from "@tanstack/react-table";
import React from "react";

// TODO: use this component for all sortable tables
// TODO: make the sorting work

/**
 * A component that renders a header for a table column that can be sorted.
 * @param root0 - The props of the component.
 * @param root0.title - The title of the column.
 * @param root0.column - The column object to which the header belongs.
 */
export default function TableHeader<TData, TValue>({
    title,
    column,
}: {
    title: string;
    column: Column<TData, TValue>;
}) {
    if (!column.getCanSort()) return <>{title}</>;

    const ascSort = () => column.toggleSorting(false);
    const descSort = () => column.toggleSorting(true);
    const clearSort = () => column.clearSorting();

    let icon: React.ReactNode;
    let headerOnClick: () => void;

    switch (column.getIsSorted()) {
        case "desc":
            icon = <i className="bi bi-arrow-down ms-auto ps-2"></i>;
            headerOnClick = clearSort;
            break;
        case "asc":
            icon = <i className="bi bi-arrow-up ms-auto ps-2"></i>;
            headerOnClick = descSort;
            break;
        default:
            icon = <i className="bi bi-arrow-down-up ms-auto ps-2"></i>;
            headerOnClick = ascSort;
            break;
    }

    return (
        <div
            className="d-flex"
            style={{ cursor: "pointer" }}
            onClick={headerOnClick}
        >
            {title}
            {icon}
        </div>
    );
}
