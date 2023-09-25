"use client";

import { employeesInfiniteQuery } from "@/client/queries/userManagement";
import { deleteUser } from "@/client/userManagementClient";
import { UserRoleTitle } from "@/types/userManagement/UserRoleTitle";
import { User } from "@/types/userManagement/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

/**
 * Renders a button to delete selected employees.
 * @param root0 - Props for the component.
 * @param root0.table - Reference to the table for which the toolbar is rendered.
 */
export default function DeleteEmployeeToolbarItem({
    table,
}: {
    table: Table<User & { mainUserRoleTitle: UserRoleTitle }>;
}) {
    const queryClient = useQueryClient();
    const session = useSession();

    const { mutate: deleteEmployeeMutate } = useMutation({
        mutationFn: async ({
            userSubmissionId,
            formioToken,
            userRoleTitle,
        }: {
            userSubmissionId: string;
            formioToken: string;
            userRoleTitle: UserRoleTitle;
        }) => {
            deleteUser(formioToken, userSubmissionId, userRoleTitle);
        },
        onMutate: ({ userSubmissionId }) => {
            console.debug("Deleting employee ...", {
                userSubmissionId,
            });
        },
        onError: (e: unknown, { userSubmissionId }) => {
            console.error("Failed to delete employee.", {
                userSubmissionId,
                error: e,
            });

            toast.error("Smazání účtu selhalo.");
        },
        onSuccess: (_, { userSubmissionId }) => {
            console.debug("Employee deleted.", {
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
                for (const row of table.getSelectedRowModel().rows) {
                    const mainRoleTitle = row.original.mainUserRoleTitle;

                    deleteEmployeeMutate({
                        formioToken: session.data?.user.formioToken!,
                        userSubmissionId: row.original._id,
                        userRoleTitle: mainRoleTitle,
                    });
                }
                table.toggleAllPageRowsSelected(false);
                // Invalidate after all changes are done
                // need to set a delay because the server tends to return the old data
                setTimeout(
                    () =>
                        queryClient.invalidateQueries({
                            queryKey: employeesInfiniteQuery.list._def,
                        }),
                    500
                );
            }}
        >
            <i className="bi bi-trash"></i>
        </Button>
    );
}
