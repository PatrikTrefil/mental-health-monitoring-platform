"use client";

import { trpc } from "@/client/trpcClient";
import AppTable from "@/components/AppTable";
import PlaceholderAppTable from "@/components/PlaceholderAppTable";
import SimplePagination from "@/components/SimplePagination";
import TableHeader from "@/components/TableHeader";
import TaskStateBadge from "@/components/TaskStateBadge";
import {
    filterColumnIdUrlParamName,
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
import { toast } from "react-toastify";
import TaskTableToolbar from "./TaskTableToolbar";

/**
 * Table of tasks for employees (includes tasks of all users).
 */
export default function TaskTable() {
    const utils = trpc.useContext();

    const deleteTodo = trpc.task.deleteTask.useMutation({
        onSuccess: () => {
            utils.task.listTasks.invalidate();
        },
        onError: () => {
            toast.error("Smazání úkolu selhalo.");
        },
    });

    const columnHelper =
        createColumnHelper<
            inferProcedureOutput<AppRouter["task"]["createTask"]>
        >();
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
            columnHelper.accessor("id", {
                id: "id",
                meta: {
                    viewOptionsLabel: "ID",
                },
                header: ({ column }) => (
                    <TableHeader text="ID" column={column} />
                ),
            }),
            columnHelper.accessor("name", {
                id: "name",
                meta: {
                    viewOptionsLabel: "Název",
                    filterLabel: "Název",
                },
                header: ({ column }) => (
                    <TableHeader text="Název" column={column} />
                ),
            }),
            columnHelper.accessor("description", {
                id: "description",
                meta: {
                    viewOptionsLabel: "Popis",
                    filterLabel: "Popis",
                },
                header: ({ column }) => (
                    <TableHeader text="Popis" column={column} />
                ),
            }),
            columnHelper.accessor("forUserId", {
                id: "forUserId",
                meta: {
                    viewOptionsLabel: "Pro uživatele",
                    filterLabel: "Pro uživatele",
                },
                header: ({ column }) => (
                    <TableHeader text="Pro uživatele" column={column} />
                ),
            }),
            columnHelper.accessor("createdAt", {
                id: "createdAt",
                meta: {
                    viewOptionsLabel: "Vytvořeno dne",
                },
                header: ({ column }) => (
                    <TableHeader text="Vytvořeno dne" column={column} />
                ),
                cell: (props) => props.row.original.createdAt.toLocaleString(),
            }),
            columnHelper.accessor("state", {
                id: "state",
                meta: {
                    viewOptionsLabel: "Stav",
                },
                header: ({ column }) => (
                    <TableHeader text="Stav" column={column} />
                ),
                cell: (props) => (
                    <TaskStateBadge taskState={props.row.original.state} />
                ),
            }),
            columnHelper.accessor("start", {
                id: "start",
                meta: {
                    viewOptionsLabel: "Začátek",
                },
                header: ({ column }) => (
                    <TableHeader text="Začátek" column={column} />
                ),
                cell: (props) =>
                    props.row.original.start?.toLocaleString() ?? "-",
            }),
            columnHelper.accessor("deadline.dueDateTime", {
                id: "deadline.dueDateTime",
                meta: {
                    viewOptionsLabel: "Deadline",
                },
                header: ({ column }) => (
                    <TableHeader text="Deadline" column={column} />
                ),
                cell: (props) =>
                    props.row.original.deadline?.dueDateTime.toLocaleString() ??
                    "-",
            }),
            columnHelper.accessor("deadline.canBeCompletedAfterDeadline", {
                id: "deadline.canBeCompletedAfterDeadline",
                meta: {
                    viewOptionsLabel: "Lze splnit po deadline?",
                },
                header: ({ column }) => (
                    <TableHeader
                        text="Lze splnit po deadline?"
                        column={column}
                    />
                ),
                cell: (props) => {
                    if (props.row.original.deadline === null) return "-";
                    return props.row.original.deadline
                        .canBeCompletedAfterDeadline
                        ? "Ano"
                        : "Ne";
                },
            }),
            columnHelper.accessor("updatedAt", {
                id: "updatedAt",
                meta: {
                    viewOptionsLabel: "Aktualizováno dne",
                },
                header: ({ column }) => (
                    <TableHeader text="Aktualizováno dne" column={column} />
                ),
                cell: (props) => props.row.original.updatedAt.toLocaleString(),
            }),
            columnHelper.display({
                id: "actions",
                meta: { viewOptionsLabel: "Akce" },
                enableSorting: false,
                header: ({ column }) => (
                    <TableHeader text="Akce" column={column} />
                ),
                cell: (props) => (
                    <div className="d-flex gap-2">
                        <Button
                            variant="danger"
                            onClick={() => {
                                props.row.toggleSelected(false);
                                deleteTodo.mutate({
                                    id: props.row.original.id,
                                });
                            }}
                        >
                            Smazat
                        </Button>
                        <OverlayTrigger
                            overlay={
                                props.row.original.state !==
                                TaskState.COMPLETED ? (
                                    <Tooltip>
                                        Formulář ještě nebyl vyplněn.
                                    </Tooltip>
                                ) : (
                                    <></>
                                )
                            }
                        >
                            <span className="d-inline-block">
                                <Button
                                    as="a"
                                    href={`/zamestnanec/formular/${props.row.original.formId}/vysledek/${props.row.original.submissionId}`}
                                    disabled={!props.row.original.submissionId}
                                >
                                    Zobrazit odevzdání
                                </Button>
                            </span>
                        </OverlayTrigger>
                    </div>
                ),
            }),
        ],
        [columnHelper, deleteTodo]
    );
    const validLimitValues = useMemo(() => [10, 20, 30], []);
    const { limit, setLimit } = useURLLimit({ validValues: validLimitValues });
    const { pageIndex, setPageIndex } = useURLPageIndex();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams()!;

    const filterColumnId = searchParams.get(filterColumnIdUrlParamName) ?? "";

    const columnFilters = useMemo(() => {
        const filterParam = searchParams.get(filterUrlParamName);
        return filterParam !== null
            ? [{ id: filterColumnId, value: filterParam }]
            : [];
    }, [searchParams, filterColumnId]);

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

    const {
        isLoading,
        isError,
        error,
        data: taskQueryData,
    } = trpc.task.listTasks.useQuery({
        pagination: {
            limit: limit,
            offset: pageIndex * limit,
        },
        sort:
            sorting[0] !== undefined
                ? {
                      field: sorting[0].id as keyof inferProcedureOutput<
                          AppRouter["task"]["createTask"]
                      >,
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

    const tasks = taskQueryData?.data;
    const totalTaskCount = taskQueryData?.count;
    const totalPages = Math.ceil((totalTaskCount ?? 0) / limit);

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
                                  field: sorting[0]
                                      .id as keyof inferProcedureOutput<
                                      AppRouter["task"]["createTask"]
                                  >,
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
                                  field: sorting[0]
                                      .id as keyof inferProcedureOutput<
                                      AppRouter["task"]["createTask"]
                                  >,
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
        [limit, pageIndex, utils, sorting, columnFilters, totalPages]
    );

    const table = useReactTable({
        columns,
        data: tasks ?? [],
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
        initialState: {
            columnVisibility: {
                updatedAt: false,
                id: false,
            },
        },
        manualPagination: true,
        autoResetPageIndex: false,
    });

    if (isError) {
        console.error(error);
        return (
            <Alert variant="danger">Načítání seznamu uživatelů selhalo.</Alert>
        );
    }

    return (
        <>
            <TaskTableToolbar
                table={table}
                filterProps={{
                    columnId: filterColumnId,
                    placeholder: "Filtrovat dle názvu",
                }}
                multiColumn={true}
            />
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
