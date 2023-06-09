"use client";

import SimplePagination from "@/components/shared/SimplePagination";
import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { UserFormSubmission } from "@/types/userFormSubmission";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";
import { Alert, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";

/**
 * Page for managing users.
 */
export default function ClientPatientTable() {
    const queryClient = useQueryClient();
    const session = useSession();

    const deleteUser = useCallback(
        async (userSubmissionId: string) => {
            console.debug("Deleting user ...", { userSubmissionId });

            try {
                if (!session.data?.user.formioToken) {
                    console.error("No token in session.");
                    return;
                }

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}klientpacient/submission/${userSubmissionId}`,
                    {
                        method: "DELETE",
                        headers: {
                            "x-jwt-token": session.data.user.formioToken,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error(
                        `Failed to delete user with status code ${response.status}`
                    );
                }
            } catch (e) {
                console.error("Failed to delete user.", { userSubmissionId });
                toast.error("Smazání účtu selhalo.");
                return;
            }
            console.debug("User deleted.", { userSubmissionId });
            await queryClient.invalidateQueries(["users"]);
        },
        [queryClient, session.data]
    );

    const columnHelper = createColumnHelper<UserFormSubmission>();
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
                    <Button
                        variant="danger"
                        onClick={() => deleteUser(props.row.original._id)}
                    >
                        Smazat
                    </Button>
                ),
            }),
        ],
        [columnHelper, deleteUser]
    );

    const [showCreateUserModal, setShowCreateUserModal] = useState(false);

    const fetchUsers = useCallback(async () => {
        if (!session.data?.user.formioToken)
            throw new Error("No token in session");

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}klientpacient/submission`,
            {
                headers: {
                    "x-jwt-token": session.data.user.formioToken,
                },
            }
        );

        return (await response.json()) as UserFormSubmission[];
    }, [session.data?.user.formioToken]);

    const { isLoading, isError, error, data, isFetching, refetch } = useQuery({
        queryKey: ["users"],
        queryFn: () => fetchUsers(),
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
                Založit účet nového pacienta/klienta
            </Button>
            <h2>Seznam pacientů/klientů</h2>
            <div className="d-flex flex-wrap align-items-center gap-2">
                <Button
                    onClick={() => {
                        refetch();
                    }}
                    className="mb-1"
                >
                    Aktualizovat
                </Button>
                {/* Since the last page's data potentially
                    sticks around between page requests, // we can use
                    `isFetching` to show a background loading // indicator since
                    our `status === 'loading'` state won't be triggered */}
                {isFetching ? (
                    <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">Načítání...</span>
                    </Spinner>
                ) : null}
            </div>
            <Form.Select
                className="my-2"
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
            <div className="d-flex justify-content-center align-items-center">
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
                    <DynamicFormWithAuth
                        absoluteSrc={`${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}klientpacient/register`}
                        onSubmitDone={() => {
                            setShowCreateUserModal(false);
                            queryClient.invalidateQueries(["users"]);
                        }}
                        onSubmitFail={() => {
                            setShowCreateUserModal(false);
                            toast.error("Registrování uživatele selhalo.");
                        }}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}
