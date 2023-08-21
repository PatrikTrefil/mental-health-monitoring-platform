"use client";

import { trpc } from "@/client/trpcClient";
import { AppRouter } from "@/server/routers/root";
import { Table } from "@tanstack/react-table";
import type { inferProcedureOutput } from "@trpc/server";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

/**
 * Renders a button to delete selected tasks.
 * @param root0 - Props for the component.
 * @param root0.table - Reference to the table for which the toolbar is rendered.
 */
export default function DeleteTodoToolbarItem({
    table,
}: {
    table: Table<inferProcedureOutput<AppRouter["task"]["createTask"]>>;
}) {
    const utils = trpc.useContext();
    const deleteTodo = trpc.task.deleteTask.useMutation({
        onSuccess: () => {
            utils.task.listTasks.invalidate();
        },
        onError: () => {
            toast.error("Smazání úkolu selhalo.");
        },
    });

    return (
        <Button
            variant="danger"
            className={`${
                table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()
                    ? ""
                    : "visually-hidden"
            }`}
            onClick={() => {
                for (const row of table.getSelectedRowModel().rows)
                    deleteTodo.mutate({ id: row.original.id });
                table.toggleAllPageRowsSelected(false);
            }}
        >
            <i className="bi bi-trash"></i>
        </Button>
    );
}
