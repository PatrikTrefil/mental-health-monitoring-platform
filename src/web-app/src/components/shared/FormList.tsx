"use client";

import { Form } from "@/types/form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import SimplePagination from "./SimplePagination";

/**
 * List of forms which are filtered and shown using FormLine.
 */
export function FormList({ filterOptions, FormLine }: FormListProps) {
    const queryClient = useQueryClient();

    const pageSize = 10;
    const [pageIndex, setPageIndex] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const session = useSession();

    const fetchForms = useCallback(
        async (page: number, currentTotalPages: number) => {
            const url = new URL(
                `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}form/`
            );
            url.searchParams.set("limit", pageSize.toString());
            url.searchParams.set("skip", (page * pageSize).toString());
            url.searchParams.set("type", "form");
            for (const [key, value] of Object.entries(filterOptions)) {
                url.searchParams.set(key, value);
            }

            const response = await fetch(url, {
                headers: {
                    "x-jwt-token": session.data!.user.formioToken, // token won't be null, because the query is disabled when it is
                },
            });
            const contentRangeParser =
                /(?<range>(?<rangeStart>[0-9]+)-(?<rangeEnd>[0-9]+)|\*)\/(?<size>[0-9]+)/;
            const match = response.headers
                .get("content-range")
                ?.match(contentRangeParser);

            if (!match) throw new Error("Invalid content-range header");

            const groups = match.groups as {
                range: string;
                rangeStart: string | undefined;
                rangeEnd: string | undefined;
                size: string;
            };
            const newTotalPages =
                groups.range === "*"
                    ? 0
                    : Math.ceil(parseInt(groups.size) / pageSize);

            if (newTotalPages !== currentTotalPages) {
                setTotalPages(newTotalPages);
            }

            return {
                forms: (await response.json()) as Form[],
                hasMore:
                    groups.range === "*"
                        ? false
                        : parseInt(groups.rangeEnd!) <
                          parseInt(groups.size) - 1,
            };
        },
        [filterOptions, session.data]
    );
    const {
        isLoading,
        isError,
        error,
        data,
        isFetching,
        refetch,
        isPreviousData,
    } = useQuery({
        queryKey: ["forms", pageIndex, totalPages],
        queryFn: () => fetchForms(pageIndex, totalPages),
        keepPreviousData: true,
        enabled: !!session.data?.user.formioToken,
    });
    // Prefetch the next page!
    useEffect(() => {
        if (!isPreviousData && data?.hasMore) {
            queryClient.prefetchQuery({
                // eslint-disable-next-line @tanstack/query/exhaustive-deps
                queryKey: ["forms", pageIndex + 1],
                queryFn: () => fetchForms(pageIndex + 1, totalPages),
            });
        }
    }, [data, isPreviousData, pageIndex, queryClient, fetchForms, totalPages]);

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
        return (
            <Alert variant="danger">Načítání seznamu formulářů selhalo.</Alert>
        );
    }

    const deleteForm = async (form: Form) => {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}${form.path}`,
            {
                method: "DELETE",
                headers: {
                    "x-jwt-token": session.data!.user.formioToken,
                },
            }
        );
        if (!response.ok) {
            console.error("Failed to delete form", { status: response.status });
            toast.error("Smazání formuláře selhalo.");
        }
        await queryClient.invalidateQueries(["forms"]);
    };

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
                    {data.forms.map((form) => (
                        <FormLine
                            key={form._id}
                            form={form}
                            deleteForm={() => deleteForm(form)}
                        />
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

/**
 * Props of a component, which is used to show a list item of a form.
 * This component is used in {@link FormList}.
 */
export interface FormLineProps {
    /**
     * Form to show.
     */
    form: Form;
    /**
     * Delete the form that is beign shown.
     */
    deleteForm: () => Promise<void>;
}

/**
 * Props for {@link FormList}
 */
export interface FormListProps {
    /**
     * Filter options for the form query. @see https://apidocs.form.io/#a39be766-02dd-0b95-49bd-971fcef25a32
     **/
    filterOptions: { [key: string]: string };
    /**
     * Component to show for each form.
     */
    FormLine: React.ComponentType<FormLineProps>;
}
