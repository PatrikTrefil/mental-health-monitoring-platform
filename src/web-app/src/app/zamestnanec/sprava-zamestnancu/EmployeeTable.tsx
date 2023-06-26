"use client";

import {
    deleteSpravceDotazniku,
    deleteZadavatelDotazniku,
    loadEmployees,
} from "@/client/formioClient";
import SimplePagination from "@/components/shared/SimplePagination";
import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { UserFormSubmission } from "@/types/userFormSubmission";
import { UserRolePrefixes, UserRoleTitles } from "@/types/users";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

/**
 * Page for managing employee accounts.
 */
export default function EmployeeTable() {
    const queryClient = useQueryClient();
    const session = useSession();

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
            columnHelper.accessor("roles", {
                header: "Role",
                cell: (props) => {
                    if (
                        props.row.original.data.id.startsWith(
                            UserRolePrefixes.SPRAVCE_DOTAZNIKU
                        )
                    )
                        return UserRoleTitles.SPRAVCE_DOTAZNIKU;
                    else if (
                        props.row.original.data.id.startsWith(
                            UserRolePrefixes.ZADAVATEL_DOTAZNIKU
                        )
                    )
                        return UserRoleTitles.ZADAVATEL_DOTAZNIKU;
                    else return "-";
                },
            }),
            columnHelper.display({
                id: "actions",
                header: "Akce",
                cell: (props) => {
                    const isOwnAccount =
                        props.row.original._id === session?.data?.user._id;
                    if (
                        session?.data?.user.data.id.startsWith(
                            UserRolePrefixes.SPRAVCE_DOTAZNIKU
                        ) ||
                        (session?.data?.user.data.id.startsWith(
                            UserRolePrefixes.ZADAVATEL_DOTAZNIKU
                        ) &&
                            props.row.original.data.id.startsWith(
                                UserRolePrefixes.ZADAVATEL_DOTAZNIKU
                            ))
                    )
                        return (
                            <Button
                                variant="danger"
                                onClick={async () => {
                                    const userSubmissionId =
                                        props.row.original._id;
                                    console.debug("Deleting employee ...", {
                                        userSubmissionId,
                                    });
                                    try {
                                        if (
                                            props.row.original.data.id.startsWith(
                                                UserRolePrefixes.SPRAVCE_DOTAZNIKU
                                            )
                                        )
                                            await deleteSpravceDotazniku(
                                                session.data?.user.formioToken!,
                                                userSubmissionId
                                            );
                                        else if (
                                            props.row.original.data.id.startsWith(
                                                UserRolePrefixes.ZADAVATEL_DOTAZNIKU
                                            )
                                        )
                                            await deleteZadavatelDotazniku(
                                                session.data?.user.formioToken!,
                                                userSubmissionId
                                            );
                                        else
                                            throw new Error(
                                                "Unknown user role."
                                            );
                                    } catch (e) {
                                        console.error(
                                            "Failed to delete employee.",
                                            {
                                                userSubmissionId,
                                                error: e,
                                            }
                                        );
                                        toast.error("Smazání účtu selhalo.");
                                        return;
                                    }
                                    console.debug("Employee deleted.", {
                                        userSubmissionId,
                                    });
                                    if (isOwnAccount) await signOut();
                                    await queryClient.invalidateQueries([
                                        "employees",
                                    ]);
                                }}
                            >
                                Smazat {isOwnAccount && "vlastní účet"}
                            </Button>
                        );
                },
            }),
        ],
        [columnHelper, queryClient, session.data]
    );

    const [
        showCreateSpravceDotaznikuModal,
        setShowCreateSpravceDotaznikuModal,
    ] = useState(false);

    const [
        showCreateZadavatelDotaznikuModal,
        setShowCreateZadavatelDotaznikuModal,
    ] = useState(false);

    const { isLoading, isError, error, data, isFetching, refetch } = useQuery({
        queryKey: ["employees", session.data],
        queryFn: () => loadEmployees(session.data!.user.formioToken),
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
                        Založit účet nového správce dotazníků
                    </Button>
                )}
                <Button
                    onClick={() => setShowCreateZadavatelDotaznikuModal(true)}
                >
                    Založit účet nového zadavatele dotazníků
                </Button>
            </div>
            <h2>Seznam zaměstnanců</h2>
            <div className="d-flex flex-wrap align-items-center gap-2">
                <Button
                    onClick={() => {
                        refetch();
                    }}
                    className="mb-1"
                    disabled={isFetching}
                >
                    {isFetching ? "Načítání..." : "Aktualizovat"}
                </Button>
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
                show={showCreateSpravceDotaznikuModal}
                onHide={() => setShowCreateSpravceDotaznikuModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Založení nového účtu pro správce dotazníků
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DynamicFormWithAuth
                        relativeFormPath={`/spravce-dotazniku/register`}
                        onSubmitDone={() => {
                            setShowCreateSpravceDotaznikuModal(false);
                            toast.success(
                                "Správce dotazníků byl úspěšně zaregistrován"
                            );
                            queryClient.invalidateQueries(["employees"]);
                        }}
                        onSubmitFail={() => {
                            toast.error("Registrování zaměstnance selhalo.");
                        }}
                        defaultValues={{
                            id: "SD-",
                        }}
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
                    <DynamicFormWithAuth
                        relativeFormPath={`/zadavatel-dotazniku/register`}
                        onSubmitDone={() => {
                            setShowCreateZadavatelDotaznikuModal(false);
                            toast.success(
                                "Zadavatel dotazníků byl úspěšně zaregistrován"
                            );
                            queryClient.invalidateQueries(["employees"]);
                        }}
                        defaultValues={{ id: "ZD-" }}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}
