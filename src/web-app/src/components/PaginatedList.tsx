import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import SimplePagination from "./SimplePagination";

/**
 * Props for the PaginatedList component.
 * @typeParam TItem type of a single item in the list
 * @typeParam TPage type of a page
 */
export interface PaginatedListProps<
    TItem,
    TPage extends {
        /**
         * Whether there are more pages to fetch.
         */
        hasMore: boolean;
        /**
         * Items on the current page.
         */
        data: TItem[];
        /**
         * Total number of pages based on the current request.
         */
        totalPages: number;
    }
> {
    /**
     *
     * @param pageIndex current page index
     * @param currentTotalPages current total number of pages
     * @returns object representing a page
     */
    fetchPage: (pageIndex: number, currentTotalPages: number) => Promise<TPage>;
    /**
     * Renders a single item in the list.
     * @param item item to render
     * @param queryClient query client used by the list (useful for invalidating queries after modifying the data)
     * @returns React node representing the item, which is going to be a child of a <li> element
     */
    renderItem: (item: TItem, queryClient: QueryClient) => React.ReactNode;
    /**
     * Extracts the key of the item.
     * @param item item to extract the key from
     * @returns key of the item
     */
    extractKey: (item: TItem) => React.Key;
    /**
     * This is going to be used as part of the query key along with page index and total pages.
     */
    queryName: string;
}

/**
 * A component that renders a list of items, paginated.
 * It uses react query to fetch the data.
 */
export default function PaginatedList<
    TItem,
    TPage extends { hasMore: boolean; data: TItem[]; totalPages: number }
>({
    fetchPage,
    renderItem,
    queryName,
    extractKey,
}: PaginatedListProps<TItem, TPage>) {
    const queryClient = useQueryClient();

    const [pageIndex, setPageIndex] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const {
        isLoading,
        isError,
        error,
        data,
        isFetching,
        refetch,
        isPreviousData,
    } = useQuery({
        queryKey: [queryName, pageIndex, totalPages],
        queryFn: async () => {
            const fetchedData = await fetchPage(pageIndex, totalPages);
            if (fetchedData.totalPages !== totalPages) {
                setTotalPages(fetchedData.totalPages);
            }
            return fetchedData;
        },
        keepPreviousData: true,
    });

    // Prefetch the next page!
    useEffect(() => {
        if (!isPreviousData && data?.hasMore) {
            queryClient.prefetchQuery({
                // eslint-disable-next-line @tanstack/query/exhaustive-deps
                queryKey: [queryName, pageIndex + 1],
                queryFn: () => fetchPage(pageIndex + 1, totalPages),
            });
        }
    }, [
        data,
        isPreviousData,
        pageIndex,
        queryClient,
        fetchPage,
        totalPages,
        queryName,
    ]);

    if (isLoading)
        return (
            <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Načítání...</span>
                </Spinner>
            </div>
        );

    if (isError) {
        console.error(error);
        return <Alert variant="danger">Načítání seznamu selhalo.</Alert>;
    }

    return (
        <>
            <div className="d-flex flex-wrap align-items-center gap-2">
                <Button
                    onClick={() => {
                        refetch();
                    }}
                    className="mb-1"
                >
                    Aktualizovat
                </Button>
                {/* Since the last page's data potentially
                    sticks around between page requests, // we can use
                    `isFetching` to show a background loading // indicator since
                    our `status === 'loading'` state won't be triggered */}
                {isFetching ? (
                    <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">Načítání...</span>
                    </Spinner>
                ) : null}
            </div>
            <div className="d-flex flex-column align-items-center gap-2">
                <ul className="list-group w-100">
                    {data.data.map((item) => (
                        <li
                            className="list-group-item d-flex justify-content-between align-items-center"
                            key={extractKey(item)}
                        >
                            {renderItem(item, queryClient)}
                        </li>
                    ))}
                </ul>
                <SimplePagination
                    pageIndex={pageIndex}
                    totalPages={totalPages}
                    setPageIndex={setPageIndex}
                />
            </div>
        </>
    );
}
