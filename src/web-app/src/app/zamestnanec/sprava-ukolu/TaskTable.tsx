"use client";

import { trpc } from "@/client/trpcClient";
import SimplePagination from "@/components/shared/SimplePagination";
import TaskStateBadge from "@/components/shared/TaskStateBadge";
import { AppRouter } from "@/server/routers/root";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { inferProcedureOutput } from "@trpc/server";
import { useMemo } from "react";
import { Alert, Button, Form, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";

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
            columnHelper.accessor("id", {
                header: "ID",
            }),
            columnHelper.accessor("name", {
                header: "Název",
            }),
            columnHelper.accessor("description", {
                header: "Popis",
            }),
            columnHelper.accessor("forUserId", {
                header: "Pro uživatele",
            }),
            columnHelper.accessor("createdAt", {
                header: "Vytvořeno dne",
                cell: (props) => props.row.original.createdAt.toLocaleString(),
            }),
            columnHelper.accessor("state", {
                header: "Stav",
                cell: (props) => (
                    <TaskStateBadge taskState={props.row.original.state} />
                ),
            }),
            columnHelper.accessor("updatedAt", {
                header: "Aktualizováno dne",
                cell: (props) => props.row.original.updatedAt.toLocaleString(),
            }),
            columnHelper.display({
                id: "actions",
                header: "Akce",
                cell: (props) => (
                    <Button
                        variant="danger"
                        onClick={() =>
                            deleteTodo.mutate({ id: props.row.original.id })
                        }
                    >
                        Smazat
                    </Button>
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
            <div className="my-2 d-block text-nowrap overflow-auto">
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
                                    <td key={cell.id}>
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
