"use client";

import { trpc } from "@/client/trpcClient";
import TableHeader from "@/components/TableHeader";
import SimplePagination from "@/components/shared/SimplePagination";
import TaskStateBadge from "@/components/shared/TaskStateBadge";
import { AppRouter } from "@/server/routers/root";
import { TaskState } from "@prisma/client";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { inferProcedureOutput } from "@trpc/server";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Button,
    Form,
    OverlayTrigger,
    Spinner,
    Table,
    Tooltip,
} from "react-bootstrap";
import { toast } from "react-toastify";
import TaskTableToolbar from "./TaskTableToolbar";

const defaultPageSize = 10;

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
            columnHelper.accessor("name", {
                id: "Název",
                header: ({ column }) => (
                    <TableHeader title="Název" column={column} />
                ),
            }),
            columnHelper.accessor("description", {
                id: "Popis",
                header: ({ column }) => (
                    <TableHeader title="Popis" column={column} />
                ),
            }),
            columnHelper.accessor("forUserId", {
                id: "Pro uživatele",
                header: ({ column }) => (
                    <TableHeader title="Pro uživatele" column={column} />
                ),
            }),
            columnHelper.accessor("createdAt", {
                id: "Vytvořeno dne",
                header: ({ column }) => (
                    <TableHeader title="Vytvořeno dne" column={column} />
                ),
                cell: (props) => props.row.original.createdAt.toLocaleString(),
            }),
            columnHelper.accessor("state", {
                id: "Stav",
                header: ({ column }) => (
                    <TableHeader title="Stav" column={column} />
                ),
                cell: (props) => (
                    <TaskStateBadge taskState={props.row.original.state} />
                ),
            }),
            columnHelper.accessor("start", {
                header: ({ column }) => (
                    <TableHeader title="Začátek" column={column} />
                ),
                cell: (props) =>
                    props.row.original.start?.toLocaleString() ?? "-",
            }),
            columnHelper.accessor("deadline.dueDateTime", {
                id: "Deadline",
                header: ({ column }) => (
                    <TableHeader title="Deadline" column={column} />
                ),
                cell: (props) =>
                    props.row.original.deadline?.dueDateTime.toLocaleString() ??
                    "-",
            }),
            columnHelper.accessor("deadline.canBeCompletedAfterDeadline", {
                id: "Lze splnit po deadline?",
                header: ({ column }) => (
                    <TableHeader
                        title="Lze splnit po deadline?"
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
                id: "Aktualizováno dne",
                header: ({ column }) => (
                    <TableHeader title="Aktualizováno dne" column={column} />
                ),
                cell: (props) => props.row.original.updatedAt.toLocaleString(),
            }),
            columnHelper.display({
                id: "Akce",
                header: ({ column }) => (
                    <TableHeader title="Akce" column={column} />
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
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [pageIndex, setPageIndex] = useState(0);

    useEffect(() => {
        // Prefetch next page
        const nextPageIndex = pageIndex + 1;
        utils.task.listTasks.prefetch({
            limit: pageSize,
            offset: nextPageIndex * pageSize,
        });
        // Prefetch previous page
        const prevPageIndex = pageIndex - 1;
        if (prevPageIndex >= 0)
            utils.task.listTasks.prefetch({
                limit: pageSize,
                offset: prevPageIndex * pageSize,
            });
    }, [pageSize, pageIndex, utils]);

    const {
        isLoading,
        isError,
        error,
        data: taskQueryData,
    } = trpc.task.listTasks.useQuery({
        limit: pageSize,
        offset: pageIndex * pageSize,
    });

    const tasks = taskQueryData?.data;
    const totalTaskCount = taskQueryData?.count;

    const table = useReactTable({
        columns,
        data: tasks ?? [],
        getCoreRowModel: getCoreRowModel(),
        initialState: {
            columnVisibility: {
                updatedAt: false,
            },
        },
        manualPagination: true,
        autoResetPageIndex: false,
    });

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
            <Alert variant="danger">Načítání seznamu uživatelů selhalo.</Alert>
        );
    }

    return (
        <>
            <TaskTableToolbar table={table} />
            <div className="mt-2 d-block text-nowrap overflow-auto">
                <Table bordered hover>
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
                            <tr
                                key={row.id}
                                className={`${
                                    row.getIsSelected() ? "table-active" : ""
                                }`}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className="align-middle"
                                        style={{
                                            width:
                                                typeof cell.column.columnDef
                                                    .meta === "object" &&
                                                "isNarrow" in
                                                    cell.column.columnDef
                                                        .meta &&
                                                cell.column.columnDef.meta
                                                    ?.isNarrow
                                                    ? "0"
                                                    : undefined,
                                        }}
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
            </div>
            <div className="d-flex justify-content-between align-items-center">
                <Form.Select
                    className="my-2 w-auto"
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30].map((currPageSize: number) => (
                        <option key={currPageSize} value={currPageSize}>
                            Zobrazit {currPageSize}
                        </option>
                    ))}
                </Form.Select>
                <SimplePagination
                    pageIndex={pageIndex}
                    totalPages={Math.ceil((totalTaskCount ?? 0) / pageSize)}
                    setPageIndex={setPageIndex}
                />
            </div>
        </>
    );
}
