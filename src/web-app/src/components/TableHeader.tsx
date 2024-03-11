import { Column } from "@tanstack/react-table";
import React from "react";

/**
 * A component that renders a header for a table column that can be sorted.
 * @param root0 - The props of the component.
 * @param root0.column - The column object to which the header belongs.
 * @param root0.text - The text of the header.
 */
export default function TableHeader<TData, TValue>({
    text: title,
    column,
}: {
    text: string;
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
            className="d-flex text-nowrap"
            style={{ cursor: "pointer" }}
            onClick={() => {
                headerOnClick();
            }}
        >
            {title}
            {icon}
        </div>
    );
}
