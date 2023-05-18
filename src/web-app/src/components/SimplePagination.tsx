import { Pagination } from "react-bootstrap";

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

interface PaginationProps {
    pageIndex: number;
    totalPages: number;
    setPageIndex: (pageIndex: number) => void;
}
