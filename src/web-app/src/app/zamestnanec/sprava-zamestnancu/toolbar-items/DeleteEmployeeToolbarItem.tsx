"use client";

import { employeesQuery, rolesQuery } from "@/client/queries/userManagement";
import { deleteUser } from "@/client/userManagementClient";
import UserRoleTitles from "@/constants/userRoleTitles";
import { UserRoleTitle } from "@/types/userManagement/UserRoleTitle";
import { Role } from "@/types/userManagement/role";
import { User } from "@/types/userManagement/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    table: Table<User>;
}) {
    const queryClient = useQueryClient();
    const session = useSession();
    const { data: roles } = useQuery({
        ...rolesQuery.list(session.data?.user.formioToken!),
        enabled: !!session.data,
    });

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
                if (roles === undefined) return;
                for (const row of table.getSelectedRowModel().rows) {
                    const userRoles = row.original.roles;
                    const roleTitles = userRoles.map((role) =>
                        roleIdToRoleTitle(role, roles)
                    );
                    let mainRoleTitle: UserRoleTitle | undefined = undefined;
                    if (roleTitles.includes(UserRoleTitles.SPRAVCE_DOTAZNIKU))
                        mainRoleTitle = UserRoleTitles.SPRAVCE_DOTAZNIKU;
                    else if (
                        roleTitles.includes(UserRoleTitles.ZADAVATEL_DOTAZNIKU)
                    )
                        mainRoleTitle = UserRoleTitles.ZADAVATEL_DOTAZNIKU;
                    else throw new Error("No main role found.");

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
                            queryKey: employeesQuery.list(
                                session.data!.user.formioToken
                            ).queryKey,
                        }),
                    500
                );
            }}
        >
            <i className="bi bi-trash"></i>
        </Button>
    );
}

/**
 * Convert ID of a role to its title.
 * @param roleId - Role id to convert.
 * @param roles - List of role objects.
 * @returns Role title of the role with the given ID.
 * @throws Error if the role ID is unknown.
 */
function roleIdToRoleTitle(roleId: string, roles: Role[]): UserRoleTitle {
    const role = roles.find((role) => role._id === roleId);
    if (!role) throw new Error("Unknown role ID.");
    return role.title;
}
