"use client";

import ExportButton from "@/app/zamestnanec/sprava-formularu/ExportButton";
import { deleteFormById } from "@/client/formManagementClient";
import { formsQuery } from "@/client/queries/formManagement";
import AppTable from "@/components/AppTable";
import PlaceholderAppTable from "@/components/PlaceholderAppTable";
import SimplePagination from "@/components/SimplePagination";
import TableHeader from "@/components/TableHeader";
import {
    filterUrlParamName,
    orderUrlParamAscValue,
    orderUrlParamDescValue,
    orderUrlParamName,
    sortUrlParamName,
} from "@/constants/urlParamNames";
import { useURLLimit } from "@/hooks/useURLLimit";
import { useURLPageIndex } from "@/hooks/useURLPageIndex";
import { Form as FormDefinition } from "@/types/formManagement/forms";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ColumnFiltersState,
    SortingState,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import FormTableToolbar from "./FormTableToolbar";

const filterColumnId = "name";

/**
 * Table of form definitions available to clients/patients.
 */
export default function FormDefinitionsTable() {
    const queryClient = useQueryClient();
    const session = useSession();

    const { mutate: deleteFormMutate } = useMutation({
        mutationFn: async ({
            formId,
            formioToken,
        }: {
            formId: string;
            formioToken: string;
        }) => {
            await deleteFormById(formioToken, formId);
        },
        onMutate: ({ formId }) => {
            console.debug("Deleting form...", { formPath: formId });
        },
        onError: (e: unknown, { formId }) => {
            console.error("Failed to delete form.", {
                error: e,
                formPath: formId,
            });
            toast.error("Smazání formuláře selhalo.");
        },
        onSuccess: (_, { formId }) => {
            console.debug("Form deleted.", { formId });
            queryClient.invalidateQueries({
                queryKey: formsQuery._def,
            });
            queryClient.invalidateQueries({
                queryKey: formsQuery.detail(
                    session.data?.user.formioToken!,
                    formId
                ).queryKey,
            });
            toast.success("Formulář byl smazán");
        },
    });

    const columnHelper = createColumnHelper<FormDefinition>();
    const columns = useMemo(
        () => [
            columnHelper.display({
                id: "select",
                header: ({ table }) => (
                    <Form.Check
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={(e) =>
                            table.toggleAllPageRowsSelected(!!e.target.checked)
                        }
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Form.Check
                        checked={row.getIsSelected()}
                        onChange={(e) => row.toggleSelected(!!e.target.checked)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                meta: {
                    isNarrow: true,
                },
            }),
            columnHelper.accessor("name", {
                id: "name",
                header: ({ column }) => (
                    <TableHeader text="Název" column={column} />
                ),
            }),
            columnHelper.accessor("created", {
                id: "created",
                header: ({ column }) => (
                    <TableHeader text="Vytvořeno dne" column={column} />
                ),
                cell: (props) =>
                    new Date(props.row.original.created).toLocaleString(),
            }),
            columnHelper.display({
                id: "actions",
                header: ({ column }) => (
                    <TableHeader text="Akce" column={column} />
                ),
                cell: (props) => (
                    <div className="d-flex align-items-center gap-2">
                        <Button
                            as="a"
                            href={`/zamestnanec/formular/${props.row.original._id}/nahled`}
                        >
                            Náhled
                        </Button>
                        <Button
                            as="a"
                            href={`/zamestnanec/formular/${props.row.original._id}/upravit`}
                        >
                            Upravit
                        </Button>
                        <Button
                            disabled={!session.data}
                            onClick={async () => {
                                props.row.toggleSelected(false);
                                deleteFormMutate({
                                    formioToken: session.data!.user.formioToken,
                                    formId: props.row.original._id,
                                });
                            }}
                            variant="danger"
                        >
                            Smazat
                        </Button>
                        <ExportButton formId={props.row.original._id} />
                        <Button
                            as="a"
                            href={`/zamestnanec/formular/${props.row.original._id}/vysledek`}
                        >
                            Výsledky
                        </Button>
                    </div>
                ),
            }),
        ],
        [columnHelper, deleteFormMutate, session.data]
    );

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams()!;

    const { pageIndex, setPageIndex } = useURLPageIndex();

    const validLimitValues = useMemo(() => [10, 20, 30], []);
    const { limit, setLimit } = useURLLimit({
        validValues: validLimitValues,
    });

    const sorting: SortingState = useMemo(() => {
        const sortParam = searchParams.get(sortUrlParamName);
        return sortParam !== null
            ? [
                  {
                      id: sortParam,
                      desc:
                          searchParams.get(orderUrlParamName) ===
                          orderUrlParamDescValue
                              ? true
                              : false,
                  },
              ]
            : [];
    }, [searchParams]);

    const columnFilters = useMemo(() => {
        const filterParam = searchParams.get(filterUrlParamName);
        return filterParam !== null
            ? [{ id: filterColumnId, value: filterParam }]
            : [];
    }, [searchParams]);

    const { isLoading, isError, error, data } = useQuery({
        ...formsQuery.list({
            formioToken: session.data?.user.formioToken!,
            pagination: {
                limit,
                offset: limit * pageIndex,
            },
            sort:
                sorting[0] !== undefined
                    ? {
                          field: sorting[0].id as keyof FormDefinition,
                          order: sorting[0].desc ? "desc" : "asc",
                      }
                    : undefined,
            filters:
                columnFilters[0] !== undefined
                    ? [
                          {
                              fieldPath: columnFilters[0].id,
                              operation: "contains",
                              comparedValue: columnFilters[0].value as string,
                          },
                      ]
                    : undefined,
            tags: ["klientPacient"],
        }),
        enabled: !!session.data?.user.formioToken,
    });

    const table = useReactTable({
        columns,
        data: data?.data ?? [],
        state: {
            sorting,
        },
        manualSorting: true,
        onSortingChange: (updaterOrValue) => {
            let newValue: SortingState;
            if (typeof updaterOrValue === "function")
                newValue = updaterOrValue(sorting);
            else newValue = updaterOrValue;

            const newParams = new URLSearchParams(searchParams);
            if (newValue[0] !== undefined) {
                newParams.set(sortUrlParamName, newValue[0].id);
                newParams.set(
                    orderUrlParamName,
                    newValue[0].desc
                        ? orderUrlParamDescValue
                        : orderUrlParamAscValue
                );
            } else {
                newParams.delete(sortUrlParamName);
                newParams.delete(orderUrlParamName);
            }

            router.replace(pathname + "?" + newParams.toString());
        },
        onColumnFiltersChange: (updaterOrValue) => {
            let newValue: ColumnFiltersState;
            if (typeof updaterOrValue === "function")
                newValue = updaterOrValue(columnFilters);
            else newValue = updaterOrValue;

            const newParams = new URLSearchParams(searchParams);
            if (newValue[0] !== undefined)
                newParams.set(filterUrlParamName, newValue[0].value as string);
            else newParams.delete(filterUrlParamName);

            router.replace(pathname + "?" + newParams.toString());
        },
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        autoResetPageIndex: false,
    });

    const totalPages = Math.ceil((data?.totalCount ?? 0) / limit);
    useEffect(
        function prefetch() {
            // Prefetch next page
            const nextPageIndex = pageIndex + 1;
            if (nextPageIndex < totalPages)
                queryClient.prefetchQuery(
                    formsQuery.list({
                        formioToken: session.data?.user.formioToken!,
                        pagination: {
                            limit,
                            offset: limit * nextPageIndex,
                        },
                        sort:
                            sorting[0] !== undefined
                                ? {
                                      field: sorting[0]
                                          .id as keyof FormDefinition,
                                      order: sorting[0].desc ? "desc" : "asc",
                                  }
                                : undefined,
                        filters:
                            columnFilters[0] !== undefined
                                ? [
                                      {
                                          fieldPath: columnFilters[0].id,
                                          operation: "contains",
                                          comparedValue: columnFilters[0]
                                              .value as string,
                                      },
                                  ]
                                : undefined,
                        tags: ["klientPacient"],
                    })
                );
            // Prefetch previous page
            const prevPageIndex = pageIndex - 1;
            if (prevPageIndex >= 0)
                queryClient.prefetchQuery(
                    formsQuery.list({
                        formioToken: session.data?.user.formioToken!,
                        pagination: {
                            limit,
                            offset: limit * prevPageIndex,
                        },
                        sort:
                            sorting[0] !== undefined
                                ? {
                                      field: sorting[0]
                                          .id as keyof FormDefinition,
                                      order: sorting[0].desc ? "desc" : "asc",
                                  }
                                : undefined,
                        filters:
                            columnFilters[0] !== undefined
                                ? [
                                      {
                                          fieldPath: columnFilters[0].id,
                                          operation: "contains",
                                          comparedValue: columnFilters[0]
                                              .value as string,
                                      },
                                  ]
                                : undefined,
                        tags: ["klientPacient"],
                    })
                );
        },
        [
            columnFilters,
            pageIndex,
            limit,
            queryClient,
            session.data?.user.formioToken,
            sorting,
            totalPages,
        ]
    );

    if (isError) {
        console.error(error);
        return (
            <Alert variant="danger">Načítání seznamu formulářů selhalo.</Alert>
        );
    }

    return (
        <>
            <FormTableToolbar table={table} filterColumnId={filterColumnId} />
            <div className="my-2">
                {isLoading ? (
                    <PlaceholderAppTable table={table} rowCount={limit} />
                ) : (
                    <AppTable table={table} />
                )}
            </div>
            <div className="d-flex justify-content-between align-items-center">
                <Form.Select
                    className="my-2 w-auto"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                >
                    {validLimitValues.map((currPageSize: number) => (
                        <option key={currPageSize} value={currPageSize}>
                            Zobrazit {currPageSize}
                        </option>
                    ))}
                </Form.Select>
                <SimplePagination
                    pageIndex={pageIndex}
                    totalPages={totalPages}
                    setPageIndex={setPageIndex}
                />
            </div>
        </>
    );
}
