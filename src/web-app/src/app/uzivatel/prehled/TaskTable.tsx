"use client";

import { trpc } from "@/client/trpcClient";
import AppTable from "@/components/AppTable";
import PlaceholderAppTable from "@/components/PlaceholderAppTable";
import SimplePagination from "@/components/SimplePagination";
import TableHeader from "@/components/TableHeader";
import TaskStateBadge from "@/components/TaskStateBadge";
import {
    filterUrlParamName,
    orderUrlParamAscValue,
    orderUrlParamDescValue,
    orderUrlParamName,
    sortUrlParamName,
} from "@/constants/urlParamNames";
import { useURLLimit } from "@/hooks/useURLLimit";
import { useURLPageIndex } from "@/hooks/useURLPageIndex";
import { AppRouter } from "@/server/routers/root";
import { TaskState } from "@prisma/client";
import {
    ColumnFiltersState,
    SortingState,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { inferProcedureOutput } from "@trpc/server";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Alert, Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { OverlayChildren } from "react-bootstrap/esm/Overlay";
import TaskTableToolbar from "./TaskTableToolbar";

const filterColumnId = "name";

/**
 * Table of tasks of the current user.
 */
export default function TaskTable() {
    const columnHelper =
        createColumnHelper<
            inferProcedureOutput<AppRouter["task"]["getTask"]>
        >();
    const columns = useMemo(
        () => [
            columnHelper.accessor("name", {
                id: "name",
                meta: { viewOptionsLabel: "Název" },
                header: ({ column }) => (
                    <TableHeader text="Název" column={column} />
                ),
            }),
            columnHelper.accessor("createdAt", {
                id: "createdAt",
                meta: { viewOptionsLabel: "Vytvořeno dne" },
                header: ({ column }) => (
                    <TableHeader text="Vytvořeno dne" column={column} />
                ),
                cell: (props) =>
                    props.row.original.createdAt.toLocaleDateString(),
            }),
            columnHelper.accessor("description", {
                id: "description",
                meta: { viewOptionsLabel: "Popis" },
                header: ({ column }) => (
                    <TableHeader text="Popis" column={column} />
                ),
                cell: (props) => props.row.original.description ?? "Bez popisu",
            }),
            columnHelper.accessor("start", {
                id: "start",
                meta: { viewOptionsLabel: "Začátek" },
                header: ({ column }) => (
                    <TableHeader text="Začátek" column={column} />
                ),
                cell: (props) =>
                    props.row.original.start?.toLocaleString() ?? "-",
            }),
            columnHelper.accessor("deadline.dueDateTime", {
                id: "deadline.dueDateTime",
                meta: { viewOptionsLabel: "Deadline" },
                header: ({ column }) => (
                    <TableHeader text="Deadline" column={column} />
                ),
                cell: (props) =>
                    props.row.original.deadline?.dueDateTime.toLocaleString() ??
                    "-",
            }),
            columnHelper.accessor("state", {
                id: "state",
                meta: { viewOptionsLabel: "Stav" },
                header: ({ column }) => (
                    <TableHeader text="Stav" column={column} />
                ),
                cell: (props) => (
                    <TaskStateBadge taskState={props.row.original.state} />
                ),
            }),
            columnHelper.display({
                id: "actions",
                meta: { viewOptionsLabel: "Akce" },
                header: ({ column }) => (
                    <TableHeader text="Akce" column={column} />
                ),
                cell: (props) => {
                    const state = props.row.original.state;

                    const deadline = props.row.original.deadline;
                    const start = props.row.original.start;
                    let tooltip: OverlayChildren;
                    switch (state) {
                        case TaskState.READY:
                            if (
                                deadline !== null &&
                                deadline.canBeCompletedAfterDeadline == false &&
                                deadline.dueDateTime < new Date()
                            )
                                tooltip = <Tooltip>Již je po termínu</Tooltip>;
                            else if (start !== null)
                                tooltip = (
                                    <Tooltip>Úkol ještě nelze splnit.</Tooltip>
                                );
                            else tooltip = <></>;
                            break;
                        case TaskState.COMPLETED:
                            tooltip = <Tooltip>Úkol je již splněn.</Tooltip>;
                            break;
                        case TaskState.PARTIALLY_COMPLETED:
                            tooltip = (
                                <Tooltip>
                                    Úkol je v procesu odevzdávání.
                                </Tooltip>
                            );
                            break;
                    }
                    const canTaskBeCompleted =
                        state === TaskState.READY &&
                        (deadline === null ||
                            deadline.canBeCompletedAfterDeadline ||
                            deadline.dueDateTime >= new Date()) &&
                        (start === null || start <= new Date());

                    return (
                        <OverlayTrigger overlay={tooltip}>
                            <span className="d-inline-block">
                                <Button
                                    variant={
                                        canTaskBeCompleted
                                            ? "primary"
                                            : "secondary"
                                    }
                                    as="a"
                                    href={`/uzivatel/formular/${props.row.original.formId}/vyplnit?taskId=${props.row.original.id}`}
                                    disabled={canTaskBeCompleted === false}
                                >
                                    Splnit
                                </Button>
                            </span>
                        </OverlayTrigger>
                    );
                },
            }),
        ],
        [columnHelper]
    );
    const validLimitValues = useMemo(() => [10, 20, 30], []);
    const { limit, setLimit } = useURLLimit({ validValues: validLimitValues });
    const { pageIndex, setPageIndex } = useURLPageIndex();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams()!;

    const columnFilters = useMemo(() => {
        const filterParam = searchParams.get(filterUrlParamName);
        return filterParam !== null
            ? [{ id: filterColumnId, value: filterParam }]
            : [];
    }, [searchParams]);

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

    const { isLoading, isError, error, data } = trpc.task.listTasks.useQuery({
        pagination: {
            limit: limit,
            offset: pageIndex * limit,
        },
        sort:
            sorting[0] !== undefined
                ? {
                      field: sorting[0].id,
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
                      } as const,
                  ]
                : undefined,
    });

    const table = useReactTable({
        columns,
        data: data?.data ?? [],
        getCoreRowModel: getCoreRowModel(),
        state: {
            sorting,
        },
        manualSorting: true,
        onSortingChange: (updaterOrValue) => {
            let newValue: SortingState;
            if (typeof updaterOrValue === "function")
                newValue = updaterOrValue(sorting);
            else newValue = updaterOrValue;

            // HACK: using toString first because of type issue https://github.com/vercel/next.js/issues/49245
            const newParams = new URLSearchParams(searchParams.toString());
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

            // HACK: using toString first because of type issue https://github.com/vercel/next.js/issues/49245
            const newParams = new URLSearchParams(searchParams.toString());
            if (newValue[0] !== undefined)
                newParams.set(filterUrlParamName, newValue[0].value as string);
            else newParams.delete(filterUrlParamName);

            router.replace(pathname + "?" + newParams.toString());
        },
        manualPagination: true,
        autoResetPageIndex: false,
    });

    const totalPages = Math.ceil((data?.count ?? 0) / limit);
    const utils = trpc.useContext();

    useEffect(
        function prefetch() {
            // Prefetch next page
            const nextPageIndex = pageIndex + 1;
            if (nextPageIndex < totalPages)
                utils.task.listTasks.prefetch({
                    pagination: {
                        limit: limit,
                        offset: nextPageIndex * limit,
                    },
                    sort:
                        sorting[0] !== undefined
                            ? {
                                  field: sorting[0].id,
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
                                  } as const,
                              ]
                            : undefined,
                });
            // Prefetch previous page
            const prevPageIndex = pageIndex - 1;
            if (prevPageIndex >= 0)
                utils.task.listTasks.prefetch({
                    pagination: {
                        limit: limit,
                        offset: prevPageIndex * limit,
                    },
                    sort:
                        sorting[0] !== undefined
                            ? {
                                  field: sorting[0].id,
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
                                  } as const,
                              ]
                            : undefined,
                });
        },
        [
            columnFilters,
            pageIndex,
            limit,
            sorting,
            totalPages,
            utils.task.listTasks,
        ]
    );

    if (isError) {
        console.error(error);
        return <Alert variant="danger">Načítání seznamu úkolů selhalo.</Alert>;
    }

    return (
        <>
            <TaskTableToolbar table={table} filterColumnId={filterColumnId} />
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
                    onChange={(e) => {
                        setLimit(Number(e.target.value));
                    }}
                >
                    {validLimitValues.map((pageSize: number) => (
                        <option key={pageSize} value={pageSize}>
                            Zobrazit {pageSize}
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
