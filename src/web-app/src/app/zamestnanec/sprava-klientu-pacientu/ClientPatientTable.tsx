"use client";

import { usersQuery } from "@/client/queries/userManagement";
import { deleteClientPacient } from "@/client/userManagementClient";
import ChangePasswordUser from "@/components/shared/ChangePasswordUser";
import CreateUser from "@/components/shared/CreateUser";
import SimplePagination from "@/components/shared/SimplePagination";
import UserRoleTitles from "@/constants/userRoleTitles";
import { User } from "@/types/userManagement/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { Alert, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";

/**
 * Page for managing users.
 */
export default function ClientPatientTable() {
    const queryClient = useQueryClient();
    const session = useSession();

    const [userToEdit, setUserToEdit] = useState<{
        submissionId: string;
        id: string;
    }>();

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

    const columnHelper = createColumnHelper<User>();
    const columns = useMemo(
        () => [
            columnHelper.accessor("data.id", {
                header: "ID",
            }),
            columnHelper.accessor("created", {
                header: "Vytvořeno dne",
                cell: (props) =>
                    new Date(props.row.original.created).toLocaleString(),
            }),
            columnHelper.display({
                id: "actions",
                header: "Akce",
                cell: (props) => (
                    <div className="d-flex gap-2">
                        <Button
                            variant="primary"
                            onClick={() =>
                                setUserToEdit({
                                    submissionId: props.row.original._id,
                                    id: props.row.original.data.id,
                                })
                            }
                        >
                            Upravit
                        </Button>
                        <Button
                            variant="danger"
                            disabled={!session.data}
                            onClick={async () => {
                                const userSubmissionId = props.row.original._id;
                                deleteUserMutate({
                                    formioToken: session.data!.user.formioToken,
                                    userSubmissionId,
                                });
                            }}
                        >
                            Smazat
                        </Button>
                    </div>
                ),
            }),
        ],
        [columnHelper, session.data, deleteUserMutate]
    );

    const [showCreateUserModal, setShowCreateUserModal] = useState(false);

    const { isLoading, isError, error, data } = useQuery({
        ...usersQuery.list(session.data?.user.formioToken!),
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
            <Alert variant="danger">Načítání seznamu uživatelů selhalo.</Alert>
        );
    }

    return (
        <>
            <Button onClick={() => setShowCreateUserModal(true)}>
                <i
                    className="bi bi-plus-lg"
                    style={{
                        paddingRight: "5px",
                    }}
                ></i>
                Založit účet nového pacienta/klienta
            </Button>
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
                show={showCreateUserModal}
                onHide={() => setShowCreateUserModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Založení nového účtu pro pacienta/klienta
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CreateUser
                        userRoleTitle={UserRoleTitles.KLIENT_PACIENT}
                        onChangeDone={() => {
                            setShowCreateUserModal(false);
                            queryClient.invalidateQueries({
                                queryKey: usersQuery.list(
                                    session.data!.user.formioToken
                                ).queryKey,
                            });
                        }}
                    />
                </Modal.Body>
            </Modal>
            <Modal show={!!userToEdit} onHide={() => setUserToEdit(undefined)}>
                <Modal.Header closeButton>
                    <Modal.Title>Úprava účtu pacienta/klienta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!!userToEdit && (
                        <ChangePasswordUser
                            submissionId={userToEdit.submissionId}
                            userId={userToEdit.id}
                            onChangeDone={() => setUserToEdit(undefined)}
                            userRoleTitle={UserRoleTitles.KLIENT_PACIENT}
                        />
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
}
