"use client";

import { deleteFormById } from "@/client/formManagementClient";
import { formsQuery } from "@/client/queries/formManagement";
import { Form as FormDefinition } from "@/types/formManagement/forms";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

/**
 * Renders a button to delete selected forms.
 * @param root0 - Props for the component.
 * @param root0.table - Reference to the table for which the toolbar is rendered.
 */
export default function DeleteFormToolbarItem({
    table,
}: {
    table: Table<FormDefinition>;
}) {
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
                queryKey: formsQuery.list._def,
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
                    deleteFormMutate({
                        formId: row.original._id,
                        formioToken: session.data?.user.formioToken!,
                    });
                table.toggleAllPageRowsSelected(false);
            }}
        >
            <i className="bi bi-trash"></i>
        </Button>
    );
}
