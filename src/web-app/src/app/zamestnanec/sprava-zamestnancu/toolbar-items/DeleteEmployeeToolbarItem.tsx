"use client";

import { employeeQuery } from "@/client/queries/userManagement";
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

    const { mutateAsync: deleteEmployeeMutateAsync } = useMutation({
        mutationFn: async ({
            employee: { submissionId, roleTitle },
            formioToken,
        }: {
            employee: {
                submissionId: string;
                roleTitle: UserRoleTitle;
                displayName: string;
            };
            formioToken: string;
        }) => deleteUser(submissionId, roleTitle, formioToken),
        onMutate: ({ employee }) => {
            console.debug("Deleting employee ...", {
                employee,
            });
        },
        onError: (e: unknown, { employee }) => {
            console.error("Failed to delete employee.", {
                employee,
                error: e,
            });

            toast.error(`Smazání účtu "${employee.displayName}" selhalo.`);
        },
        onSuccess: (_, { employee }) => {
            console.debug("Employee deleted.", {
                employee,
            });
        },
    });
    const { mutate: deleteEmployeesMutate } = useMutation({
        mutationFn: async ({
            employees,
            formioToken,
        }: {
            employees: {
                submissionId: string;
                roleTitle: UserRoleTitle;
                displayName: string;
            }[];
            formioToken: string;
        }) => {
            await Promise.all(
                employees.map((employee) =>
                    deleteEmployeeMutateAsync({
                        employee,
                        formioToken,
                    })
                )
            );
        },
        onSuccess: (_, { employees }) => {
            toast.success(`Zaměstnanecké účty (${employees.length}) smazány.`);

            queryClient.invalidateQueries({
                queryKey: employeeQuery.infiniteList._def,
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
                deleteEmployeesMutate({
                    employees: table.getSelectedRowModel().rows.map((row) => ({
                        roleTitle: row.original.mainUserRoleTitle,
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
