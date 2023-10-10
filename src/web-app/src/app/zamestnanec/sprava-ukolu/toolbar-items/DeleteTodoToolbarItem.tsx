"use client";

import { trpc } from "@/client/trpcClient";
import { AppRouter } from "@/server/routers/root";
import { useMutation } from "@tanstack/react-query";
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
    const deleteTodoTrpc = trpc.task.deleteTask.useMutation();
    const { mutateAsync: deleteTodoMutateAsync } = useMutation({
        mutationFn: ({ id }: { id: string; name: string }) =>
            deleteTodoTrpc.mutateAsync({ id }),
        onError: (_, { name }) =>
            toast.error(`Smazání úkolu "${name}" selhalo.`),
    });
    const deleteTodos = useMutation({
        mutationFn: async (todos: { id: string; name: string }[]) => {
            await Promise.all(
                todos.map(({ id, name }) => deleteTodoMutateAsync({ id, name }))
            );
        },
        onSuccess: (_, input) => {
            toast.success(`Úkoly (${input.length}) byly smazány.`);
            utils.task.listTasks.invalidate();
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
                deleteTodos.mutate(
                    table.getSelectedRowModel().rows.map((row) => ({
                        id: row.original.id,
                        name: row.original.name,
                    }))
                );
                table.toggleAllPageRowsSelected(false);
            }}
        >
            <i className="bi bi-trash"></i>
        </Button>
    );
}
