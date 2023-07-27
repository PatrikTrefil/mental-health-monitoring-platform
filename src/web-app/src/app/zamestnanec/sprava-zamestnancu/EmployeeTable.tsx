"use client";

import { employeesQuery } from "@/client/queries/userManagement";
import {
    deleteSpravceDotazniku,
    deleteZadavatelDotazniku,
} from "@/client/userManagementClient";
import SimplePagination from "@/components/shared/SimplePagination";
import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { UserIDRolePrefixes } from "@/constants/userIDRolePrefixes";
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
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { Alert, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import EditEmployee from "./EditEmployee";

/**
 * Page for managing employee accounts.
 */
export default function EmployeeTable() {
    const queryClient = useQueryClient();
    const session = useSession();

    const [userToEdit, setUserToEdit] = useState<{
        submissionId: string;
        formPath: string;
        employeeId: string;
    }>();

    const { mutate: deleteEmployeeMutate } = useMutation({
        mutationFn: async ({
            userSubmissionId,
            userId,
            formioToken,
        }: {
            userSubmissionId: string;
            userId: string;
            formioToken: string;
        }) => {
            if (userId.startsWith(UserIDRolePrefixes.SPRAVCE_DOTAZNIKU))
                await deleteSpravceDotazniku(formioToken, userSubmissionId);
            else if (userId.startsWith(UserIDRolePrefixes.ZADAVATEL_DOTAZNIKU))
                await deleteZadavatelDotazniku(formioToken, userSubmissionId);
            else throw new Error("Unknown user role.");
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
                queryKey: employeesQuery.list(
                    session.data!.user.formioToken,
                    session.data!.user.data.id
                ).queryKey,
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
            columnHelper.accessor("roles", {
                header: "Role",
                cell: (props) => {
                    if (
                        props.row.original.data.id.startsWith(
                            UserIDRolePrefixes.SPRAVCE_DOTAZNIKU
                        )
                    )
                        return UserRoleTitles.SPRAVCE_DOTAZNIKU;
                    else if (
                        props.row.original.data.id.startsWith(
                            UserIDRolePrefixes.ZADAVATEL_DOTAZNIKU
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
                    let deleteButton: React.ReactNode | null;
                    if (
                        session?.data?.user.data.id.startsWith(
                            UserIDRolePrefixes.SPRAVCE_DOTAZNIKU
                        ) ||
                        (session?.data?.user.data.id.startsWith(
                            UserIDRolePrefixes.ZADAVATEL_DOTAZNIKU
                        ) &&
                            props.row.original.data.id.startsWith(
                                UserIDRolePrefixes.ZADAVATEL_DOTAZNIKU
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
                                        userId: props.row.original.data.id,
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
                                    let formPath: string;
                                    if (
                                        props.row.original.data.id.startsWith(
                                            "SD"
                                        )
                                    )
                                        formPath =
                                            "/spravce-dotazniku/register";
                                    else if (
                                        props.row.original.data.id.startsWith(
                                            "ZD"
                                        )
                                    )
                                        formPath =
                                            "/zadavatel-dotazniku/register";
                                    else throw new Error("Unknown user prefix");

                                    setUserToEdit({
                                        submissionId: props.row.original._id,
                                        employeeId: props.row.original.data.id,
                                        formPath,
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
        [columnHelper, deleteEmployeeMutate, session.data]
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
        ...employeesQuery.list(
            session.data?.user.formioToken!,
            session.data?.user.data.id!
        ),
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
            <Modal show={!!userToEdit} onHide={() => setUserToEdit(undefined)}>
                <Modal.Header closeButton>
                    <Modal.Title>Úprava zaměstnance</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {userToEdit && <EditEmployee {...userToEdit} />}
                </Modal.Body>
            </Modal>
        </>
    );
}
