"use client";

import { usersQuery } from "@/client/queries/userManagement";
import { deleteClientPacient } from "@/client/userManagementClient";
import { User } from "@/types/userManagement/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

/**
 * Renders a button to delete selected clients/patients.
 * @param root0 - Props for the component.
 * @param root0.table - Reference to the table for which the toolbar is rendered.
 */
export default function DeleteClientPatientToolbarItem({
    table,
}: {
    table: Table<User>;
}) {
    const queryClient = useQueryClient();
    const session = useSession();

    const { mutate: deleteUserMutate } = useMutation({
        mutationFn: async ({
            formioToken,
            userSubmissionId,
        }: {
            formioToken: string;
            userSubmissionId: string;
        }) => {
            await deleteClientPacient(formioToken, userSubmissionId);
        },
        onError: (e: unknown, { userSubmissionId }) => {
            console.error("Failed to delete user.", {
                userSubmissionId,
                error: e,
            });

            toast.error("Smazání účtu selhalo.");
        },
        onSuccess: (_, { userSubmissionId }) => {
            console.debug("User deleted.", {
                userSubmissionId,
            });
            queryClient.invalidateQueries({
                queryKey: usersQuery.list(session.data!.user.formioToken)
                    .queryKey,
            });
            queryClient.invalidateQueries({
                queryKey: usersQuery.detail(
                    session.data!.user.formioToken,
                    userSubmissionId
                ).queryKey,
            });
        },
        onMutate: ({ userSubmissionId }) => {
            console.debug("Deleting user ...", {
                userSubmissionId,
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
                for (const row of table.getSelectedRowModel().rows)
                    deleteUserMutate({
                        userSubmissionId: row.original._id,
                        formioToken: session.data?.user.formioToken!,
                    });
                table.toggleAllPageRowsSelected(false);
            }}
        >
            <i className="bi bi-trash"></i>
        </Button>
    );
}
