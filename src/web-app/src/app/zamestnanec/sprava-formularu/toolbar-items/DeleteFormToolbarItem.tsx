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

    const { mutateAsync: deleteFormMutateAsync } = useMutation({
        mutationFn: async ({
            form: { id },
            formioToken,
        }: {
            form: { id: string; name: string };
            formioToken: string;
        }) => {
            await deleteFormById(formioToken, id);
        },
        onMutate: ({ form }) => {
            console.debug("Deleting form...", { form });
        },
        onError: (e: unknown, { form }) => {
            console.error("Failed to delete form.", {
                error: e,
                form,
            });
            toast.error(`Smazání formuláře "${form.name}" selhalo.`);
        },
        onSuccess: (_, { form }) => {
            console.debug("Form deleted.", { form });
        },
    });
    const { mutate: deleteFormsMutate } = useMutation({
        mutationFn: ({
            forms,
            formioToken,
        }: {
            forms: { id: string; name: string }[];
            formioToken: string;
        }) => {
            return Promise.all(
                forms.map((form) =>
                    deleteFormMutateAsync({ form, formioToken })
                )
            );
        },
        onSuccess: (_, { forms }) => {
            console.debug("Forms deleted.", { forms });
            toast.success(`Formuláře (${forms.length}) byl smazány`);

            queryClient.invalidateQueries({
                queryKey: formsQuery.list._def,
            });
            for (const { id: formId } of forms)
                queryClient.invalidateQueries({
                    queryKey: formsQuery.detail(
                        session.data?.user.formioToken!,
                        formId
                    ).queryKey,
                });
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
                deleteFormsMutate({
                    forms: table.getSelectedRowModel().rows.map((r) => ({
                        id: r.original._id,
                        name: r.original.name,
                    })),
                    formioToken: session.data?.user.formioToken!,
                });
                table.toggleAllPageRowsSelected(false);
            }}
        >
            <i className="bi bi-trash"></i>
        </Button>
    );
}
