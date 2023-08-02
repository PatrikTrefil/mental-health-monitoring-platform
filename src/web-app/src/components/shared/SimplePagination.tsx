"use client";

import { Pagination } from "react-bootstrap";

/**
 * Props for {@link SimplePagination}.
 */
export interface PaginationProps {
    /**
     * Index of the current page (starting from 0).
     */
    pageIndex: number;
    /**
     * Total number of pages.
     */
    totalPages: number;
    /**
     * Function to set the current page index.
     */
    setPageIndex: (pageIndex: number) => void;
}

/**
 * Simple pagination component.
 * @param root0 - Props.
 * @param root0.pageIndex - Index of the current page (starting from 0).
 * @param root0.totalPages - Total number of pages.
 * @param root0.setPageIndex - Function to set the current page index.
 */
export default function SimplePagination({
    pageIndex,
    totalPages,
    setPageIndex,
}: PaginationProps) {
    return (
        <Pagination className="my-1">
            <Pagination.First
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
            />
            <Pagination.Prev
                onClick={() => setPageIndex(pageIndex - 1)}
                disabled={pageIndex === 0}
            />
            <Pagination.Item active>{pageIndex + 1}</Pagination.Item>
            <Pagination.Next
                disabled={pageIndex === totalPages - 1}
                onClick={() => setPageIndex(pageIndex + 1)}
            />
            <Pagination.Last
                onClick={() => setPageIndex(totalPages - 1)}
                disabled={pageIndex === totalPages - 1}
            />
        </Pagination>
    );
}
