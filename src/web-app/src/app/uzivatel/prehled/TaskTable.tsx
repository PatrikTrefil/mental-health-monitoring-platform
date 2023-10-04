"use client";

import { trpc } from "@/client/trpcClient";
import TableHeader from "@/components/TableHeader";
import SimplePagination from "@/components/shared/SimplePagination";
import TaskStateBadge from "@/components/shared/TaskStateBadge";
import {
    filterUrlParamName,
    orderUrlParamAscValue,
    orderUrlParamDescValue,
    orderUrlParamName,
    sortUrlParamName,
} from "@/constants/urlParamNames";
import { AppRouter } from "@/server/routers/root";
import { TaskState } from "@prisma/client";
import {
    ColumnFiltersState,
    SortingState,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { inferProcedureOutput } from "@trpc/server";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
    Alert,
    Button,
    Form,
    OverlayTrigger,
    Spinner,
    Table,
    Tooltip,
} from "react-bootstrap";
import { OverlayChildren } from "react-bootstrap/esm/Overlay";
import TaskTableToolbar from "./TaskTableToolbar";

const defaultPageSize = 10;
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
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [pageIndex, setPageIndex] = useState(0);

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
            limit: pageSize,
            offset: pageIndex * pageSize,
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

    if (isError) {
        console.error(error);
        return <Alert variant="danger">Načítání seznamu úkolů selhalo.</Alert>;
    }

    return (
        <>
            <TaskTableToolbar table={table} filterColumnId={filterColumnId} />
            <div className="my-2 d-block text-nowrap overflow-auto w-100">
                {isLoading ? (
                    <div className="position-absolute top-50 start-50 translate-middle">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Načítání...</span>
                        </Spinner>
                    </div>
                ) : (
                    <Table striped bordered hover>
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="align-middle"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
            <div className="d-flex justify-content-between align-items-center">
                <Form.Select
                    className="my-2 w-auto"
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30].map((pageSize: number) => (
                        <option key={pageSize} value={pageSize}>
                            Zobrazit {pageSize}
                        </option>
                    ))}
                </Form.Select>
                <SimplePagination
                    pageIndex={pageIndex}
                    totalPages={Math.ceil(data?.count ?? 0 / pageSize)}
                    setPageIndex={setPageIndex}
                />
            </div>
        </>
    );
}
