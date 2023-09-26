"use client";

import { usersQuery } from "@/client/queries/userManagement";
import { deleteClientPacient } from "@/client/userManagementClient";
import TableHeader from "@/components/TableHeader";
import ChangePasswordUser from "@/components/shared/ChangePasswordUser";
import SimplePagination from "@/components/shared/SimplePagination";
import {
    orderUrlParamAscValue,
    orderUrlParamDescValue,
    orderUrlParamName,
    sortUrlParamName,
} from "@/constants/urlSort";
import UserRoleTitles from "@/constants/userRoleTitles";
import { User } from "@/types/userManagement/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    SortingState,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import ClientPatientTableToolbar from "./ClientPatientTableToolbar";

const defaultPageSize = 10;

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
                queryKey: usersQuery.list._def,
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
            columnHelper.display({
                id: "select",
                header: ({ table }) => (
                    <Form.Check
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={(e) =>
                            table.toggleAllPageRowsSelected(!!e.target.checked)
                        }
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Form.Check
                        checked={row.getIsSelected()}
                        onChange={(e) => row.toggleSelected(!!e.target.checked)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                meta: {
                    isNarrow: true,
                },
            }),
            columnHelper.accessor("data.id", {
                id: "data.id",
                header: ({ column }) => (
                    <TableHeader text="ID" column={column} />
                ),
            }),
            columnHelper.accessor("created", {
                id: "created",
                header: ({ column }) => (
                    <TableHeader text="Vytvořeno dne" column={column} />
                ),
                cell: (props) =>
                    new Date(props.row.original.created).toLocaleString(),
            }),
            columnHelper.display({
                id: "actions",
                header: ({ column }) => (
                    <TableHeader text="Akce" column={column} />
                ),
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
                                props.row.toggleSelected(false);
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

    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [pageIndex, setPageIndex] = useState(0);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams()!;

    const sorting: SortingState = useMemo(() => {
        const sortParam = searchParams.get(sortUrlParamName);
        return sortParam !== null
            ? [
                  {
                      id: sortParam,
                      desc:
                          searchParams.get(orderUrlParamName) ===
                          orderUrlParamDescValue
                              ? true
                              : false,
                  },
              ]
            : [];
    }, [searchParams]);

    const { isLoading, isError, error, data } = useQuery({
        ...usersQuery.list({
            formioToken: session.data?.user.formioToken!,
            pagination: {
                limit: pageSize,
                offset: pageIndex * pageSize,
            },
            sort:
                sorting[0] !== undefined
                    ? {
                          field: sorting[0].id,
                          order: sorting[0].desc ? "desc" : "asc",
                      }
                    : undefined,
        }),
        enabled: !!session.data?.user.formioToken,
    });

    const table = useReactTable({
        columns,
        data: data?.data ?? [],
        getCoreRowModel: getCoreRowModel(),
        state: {
            sorting,
        },
        manualSorting: true,
        onSortingChange: (updaterOrValue) => {
            let newValue: SortingState;
            if (typeof updaterOrValue === "function")
                newValue = updaterOrValue(sorting);
            else newValue = updaterOrValue;

            // HACK: using toString first because of type issue https://github.com/vercel/next.js/issues/49245
            const newParams = new URLSearchParams(searchParams.toString());
            if (newValue[0] !== undefined) {
                newParams.set(sortUrlParamName, newValue[0].id);
                newParams.set(
                    orderUrlParamName,
                    newValue[0].desc
                        ? orderUrlParamDescValue
                        : orderUrlParamAscValue
                );
            } else {
                newParams.delete(sortUrlParamName);
                newParams.delete(orderUrlParamName);
            }

            router.replace(pathname + "?" + newParams.toString());
        },
        manualPagination: true,
        autoResetPageIndex: false,
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
            <ClientPatientTableToolbar table={table} />
            <div className="my-2 d-block text-nowrap overflow-auto">
                <Table bordered hover>
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
                            <tr
                                key={row.id}
                                className={`${
                                    row.getIsSelected() ? "table-active" : ""
                                }`}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className="align-middle"
                                        style={{
                                            width:
                                                typeof cell.column.columnDef
                                                    .meta === "object" &&
                                                "isNarrow" in
                                                    cell.column.columnDef
                                                        .meta &&
                                                cell.column.columnDef.meta
                                                    ?.isNarrow
                                                    ? "0"
                                                    : undefined,
                                        }}
                                    >
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
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30].map((pageSize: number) => (
                        <option key={pageSize} value={pageSize}>
                            Zobrazit {pageSize}
                        </option>
                    ))}
                </Form.Select>
                <SimplePagination
                    pageIndex={pageIndex}
                    totalPages={Math.ceil(data.totalCount / pageSize)}
                    setPageIndex={setPageIndex}
                />
            </div>

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
