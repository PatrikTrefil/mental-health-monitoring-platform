"use client";

import { trpc } from "@/client/trpcClient";
import SimplePagination from "@/components/shared/SimplePagination";
import TaskStateBadge from "@/components/shared/TaskStateBadge";
import { Task, TaskState } from "@prisma/client";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
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
import { OverlayChildren } from "react-bootstrap/esm/Overlay";

export default function TaskTable() {
    const columnHelper = createColumnHelper<Task>();
    const columns = useMemo(
        () => [
            columnHelper.accessor("name", {
                header: "Název",
            }),
            columnHelper.accessor("createdAt", {
                header: "Vytvořeno dne",
                cell: (props) =>
                    props.row.original.createdAt.toLocaleDateString(),
            }),
            columnHelper.accessor("description", {
                header: "Popis",
                cell: (props) => props.row.original.description ?? "Bez popisu",
            }),
            columnHelper.accessor("state", {
                header: "Stav",
                cell: (props) => (
                    <TaskStateBadge taskState={props.row.original.state} />
                ),
            }),
            columnHelper.display({
                id: "actions",
                header: "Akce",
                cell: (props) => {
                    const state = props.row.original.state;
                    let tooltip: OverlayChildren;
                    switch (state) {
                        case TaskState.READY:
                            tooltip = <></>;
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
                    return (
                        <OverlayTrigger overlay={tooltip}>
                            <span className="d-inline-block">
                                <Button
                                    variant={
                                        props.row.original.state ===
                                        TaskState.READY
                                            ? "primary"
                                            : "secondary"
                                    }
                                    as="a"
                                    href={`/uzivatel/formular/${props.row.original.formId}/vyplnit?taskId=${props.row.original.id}`}
                                    disabled={
                                        props.row.original.state !==
                                        TaskState.READY
                                    }
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
            <div className="my-2 d-block text-nowrap overflow-auto w-100">
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
