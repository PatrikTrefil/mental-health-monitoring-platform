"use client";

import { employeesQuery, rolesQuery } from "@/client/queries/userManagement";
import { deleteUser } from "@/client/userManagementClient";
import ChangePasswordUser from "@/components/shared/ChangePasswordUser";
import CreateUser from "@/components/shared/CreateUser";
import SimplePagination from "@/components/shared/SimplePagination";
import UserRoleTitles from "@/constants/userRoleTitles";
import { UserRoleTitle } from "@/types/userManagement/UserRoleTitle";
import { Role } from "@/types/userManagement/role";
import { User } from "@/types/userManagement/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { Alert, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";

function roleIdToRoleTitle(roleId: string, roles: Role[]): UserRoleTitle {
    const role = roles.find((role) => role._id === roleId);
    if (!role) throw new Error("Unknown role ID.");
    return role.title;
}

/**
 * Page for managing employee accounts.
 */
export default function EmployeeTable() {
    const queryClient = useQueryClient();
    const session = useSession();

    const [userToEdit, setUserToEdit] = useState<{
        submissionId: string;
        userId: string;
        roleTitle: UserRoleTitle;
    }>();

    const { data: roles } = useQuery({
        ...rolesQuery.list(session.data?.user.formioToken!),
        enabled: !!session.data,
    });

    const roleTitlesCurrentUser = session.data?.user.roleTitles;

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
            console.debug("Employees deleted.", {
                userSubmissionId,
            });
            queryClient.invalidateQueries({
                queryKey: employeesQuery.list(session.data!.user.formioToken)
                    .queryKey,
            });
        },
    });

    const columnHelper = createColumnHelper<User>();
    const columns = useMemo(
        () => [
            columnHelper.accessor("data.id", {
                header: "ID",
                cell: (props) => {
                    if (roles === undefined) return null;

                    const userRoles = props.row.original.roles;
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

                    return (
                        <>
                            {props.row.original.data.id}{" "}
                            <i>({mainRoleTitle ?? "-"})</i>
                        </>
                    );
                },
            }),
            columnHelper.accessor("created", {
                header: "Vytvořeno dne",
                cell: (props) =>
                    new Date(props.row.original.created).toLocaleString(),
            }),
            columnHelper.display({
                id: "actions",
                header: "Akce",
                cell: (props) => {
                    if (
                        roles === undefined ||
                        roleTitlesCurrentUser === undefined
                    )
                        return null;
                    const isOwnAccount =
                        props.row.original._id === session?.data?.user._id;
                    let deleteButton: React.ReactNode | null;

                    const userRoles = props.row.original.roles;
                    const roleTitlesRow = userRoles.map((role) =>
                        roleIdToRoleTitle(role, roles)
                    );
                    let mainUserRoleTitle: UserRoleTitle;
                    if (
                        roleTitlesRow.includes(UserRoleTitles.SPRAVCE_DOTAZNIKU)
                    )
                        mainUserRoleTitle = UserRoleTitles.SPRAVCE_DOTAZNIKU;
                    else if (
                        roleTitlesRow.includes(
                            UserRoleTitles.ZADAVATEL_DOTAZNIKU
                        )
                    )
                        mainUserRoleTitle = UserRoleTitles.ZADAVATEL_DOTAZNIKU;
                    else throw new Error("Unknown user role.");

                    if (
                        roleTitlesCurrentUser.includes(
                            UserRoleTitles.SPRAVCE_DOTAZNIKU
                        ) ||
                        (roleTitlesCurrentUser.includes(
                            UserRoleTitles.ZADAVATEL_DOTAZNIKU
                        ) &&
                            roleTitlesRow.includes(
                                UserRoleTitles.ZADAVATEL_DOTAZNIKU
                            ))
                    )
                        deleteButton = (
                            <Button
                                variant="danger"
                                disabled={!session.data}
                                onClick={async () => {
                                    deleteEmployeeMutate({
                                        userSubmissionId:
                                            props.row.original._id,
                                        userRoleTitle: mainUserRoleTitle,
                                        formioToken:
                                            session.data!.user.formioToken,
                                    });

                                    if (isOwnAccount) await signOut();
                                }}
                            >
                                Smazat {isOwnAccount && "vlastní účet"}
                            </Button>
                        );
                    return (
                        <div className="d-flex gap-2">
                            {deleteButton}
                            <Button
                                onClick={() => {
                                    setUserToEdit({
                                        submissionId: props.row.original._id,
                                        userId: props.row.original.data.id,
                                        roleTitle: mainUserRoleTitle,
                                    });
                                }}
                            >
                                Upravit {isOwnAccount && "vlastní účet"}
                            </Button>
                        </div>
                    );
                },
            }),
        ],
        [
            columnHelper,
            roles,
            session.data,
            roleTitlesCurrentUser,
            deleteEmployeeMutate,
        ]
    );

    const [
        showCreateSpravceDotaznikuModal,
        setShowCreateSpravceDotaznikuModal,
    ] = useState(false);

    const [
        showCreateZadavatelDotaznikuModal,
        setShowCreateZadavatelDotaznikuModal,
    ] = useState(false);

    const { isLoading, isError, error, data } = useQuery({
        ...employeesQuery.list(session.data?.user.formioToken!),
        enabled: !!session.data?.user.formioToken,
    });

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
            <Alert variant="danger">
                Načítání seznamu zaměstnanců selhalo.
            </Alert>
        );
    }

    return (
        <>
            <div className="d-flex gap-2">
                {session?.data?.user.roleTitles.includes(
                    UserRoleTitles.SPRAVCE_DOTAZNIKU
                ) && (
                    <Button
                        onClick={() => setShowCreateSpravceDotaznikuModal(true)}
                    >
                        <i
                            className="bi bi-plus-lg"
                            style={{
                                paddingRight: "5px",
                            }}
                        ></i>
                        Založit účet nového správce dotazníků
                    </Button>
                )}
                <Button
                    onClick={() => setShowCreateZadavatelDotaznikuModal(true)}
                >
                    <i
                        className="bi bi-plus-lg"
                        style={{
                            paddingRight: "5px",
                        }}
                    ></i>
                    Založit účet nového zadavatele dotazníků
                </Button>
            </div>

            <div className="my-2 d-block text-nowrap overflow-auto">
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
            <Modal
                show={showCreateSpravceDotaznikuModal}
                onHide={() => setShowCreateSpravceDotaznikuModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Založení nového účtu pro správce dotazníků
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CreateUser
                        userRoleTitle={UserRoleTitles.SPRAVCE_DOTAZNIKU}
                        onChangeDone={() =>
                            setShowCreateSpravceDotaznikuModal(false)
                        }
                    />
                </Modal.Body>
            </Modal>
            <Modal
                show={showCreateZadavatelDotaznikuModal}
                onHide={() => setShowCreateZadavatelDotaznikuModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Založení nového účtu pro zadavatele dotazníků
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CreateUser
                        userRoleTitle={UserRoleTitles.ZADAVATEL_DOTAZNIKU}
                        onChangeDone={() =>
                            setShowCreateZadavatelDotaznikuModal(false)
                        }
                    />
                </Modal.Body>
            </Modal>
            <Modal show={!!userToEdit} onHide={() => setUserToEdit(undefined)}>
                <Modal.Header closeButton>
                    <Modal.Title>Úprava zaměstnance</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {userToEdit && (
                        <ChangePasswordUser
                            submissionId={userToEdit.submissionId}
                            userId={userToEdit.userId}
                            userRoleTitle={userToEdit.roleTitle}
                            onChangeDone={() => setUserToEdit(undefined)}
                        />
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
}
