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

    const { mutateAsync: deleteUserMutateAsync } = useMutation({
        mutationFn: ({
            formioToken,
            user: { submissionId },
        }: {
            formioToken: string;
            user: { submissionId: string; displayName: string };
        }) => deleteClientPacient(formioToken, submissionId),
        onMutate: ({ user }) => {
            console.debug("Deleting client/patient ...", { user });
        },
        onError: (_, { user }) =>
            toast.error(`Smazání účtu "${user.displayName}" selhalo.`),
        onSuccess: (_, { user }) => {
            console.debug("Deleted client/patient ...", {
                user,
            });
        },
    });
    const { mutate: deleteUsersMutate } = useMutation({
        mutationFn: async ({
            formioToken,
            users,
        }: {
            formioToken: string;
            users: { submissionId: string; displayName: string }[];
        }) => {
            await Promise.all(
                users.map((user) =>
                    deleteUserMutateAsync({
                        formioToken,
                        user,
                    })
                )
            );
        },
        onError: (error: unknown, { users }) => {
            console.error("Failed to delete users.", {
                users,
                error,
            });
        },
        onSuccess: (_, { users }) => {
            console.debug("Users deleted.", {
                users,
            });
            toast.success(`Účty (${users.length}) byly smazány.`);
            queryClient.invalidateQueries({
                queryKey: usersQuery.list._def,
            });
            for (const { submissionId } of users)
                queryClient.invalidateQueries({
                    queryKey: usersQuery.detail(
                        session.data!.user.formioToken,
                        submissionId
                    ).queryKey,
                });
        },
        onMutate: ({ users }) => {
            console.debug("Deleting users ...", {
                users,
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
                deleteUsersMutate({
                    users: table.getSelectedRowModel().rows.map((row) => ({
                        submissionId: row.original._id,
                        displayName: row.original.data.id,
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
