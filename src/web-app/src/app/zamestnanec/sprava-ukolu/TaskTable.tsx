"use client";

import { trpc } from "@/client/trpcClient";
import SimplePagination from "@/components/shared/SimplePagination";
import TaskStateBadge from "@/components/shared/TaskStateBadge";
import { AppRouter } from "@/server/routers/root";
import { TaskState } from "@prisma/client";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { inferProcedureOutput } from "@trpc/server";
import { useMemo } from "react";
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
                header: "Název",
            }),
            columnHelper.accessor("description", {
                id: "Popis",
                header: "Popis",
            }),
            columnHelper.accessor("forUserId", {
                id: "Pro uživatele",
                header: "Pro uživatele",
            }),
            columnHelper.accessor("createdAt", {
                id: "Vytvořeno dne",
                header: "Vytvořeno dne",
                cell: (props) => props.row.original.createdAt.toLocaleString(),
            }),
            columnHelper.accessor("state", {
                id: "Stav",
                header: "Stav",
                cell: (props) => (
                    <TaskStateBadge taskState={props.row.original.state} />
                ),
            }),
            columnHelper.accessor("deadline.dueDateTime", {
                id: "Deadline",
                header: "Deadline",
                cell: (props) =>
                    props.row.original.deadline?.dueDateTime.toLocaleString() ??
                    "-",
            }),
            columnHelper.accessor("deadline.canBeCompletedAfterDeadline", {
                id: "Lze splnit po deadline?",
                header: "Lze splnit po deadline?",
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
                header: "Aktualizováno dne",
                cell: (props) => props.row.original.updatedAt.toLocaleString(),
            }),
            columnHelper.display({
                id: "Akce",
                header: "Akce",
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

    const { isLoading, isError, error, data } = trpc.task.listTasks.useQuery();

    const table = useReactTable({
        columns,
        data: data ?? [],
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            columnVisibility: {
                updatedAt: false,
            },
        },
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
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                        table.setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30].map((pageSize: number) => (
                        <option key={pageSize} value={pageSize}>
                            Zobrazit {pageSize}
                        </option>
                    ))}
                </Form.Select>
                <SimplePagination
                    pageIndex={table.getState().pagination.pageIndex}
                    totalPages={table.getPageCount()}
                    setPageIndex={table.setPageIndex}
                />
            </div>
        </>
    );
}
