import { Pagination } from "react-bootstrap";

/**
 * Props for {@link SimplePagination}
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
 */
export default function SimplePagination({
    pageIndex,
    totalPages,
    setPageIndex,
}: PaginationProps) {
    return (
        <Pagination>
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
