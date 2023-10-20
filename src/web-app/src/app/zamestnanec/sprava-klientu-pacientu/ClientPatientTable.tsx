"use client";

import { usersQuery } from "@/client/queries/userManagement";
import { deleteClientPacient } from "@/client/userManagementClient";
import AppTable from "@/components/AppTable";
import ChangePasswordUser from "@/components/ChangePasswordUser";
import PlaceholderAppTable from "@/components/PlaceholderAppTable";
import SimplePagination from "@/components/SimplePagination";
import TableHeader from "@/components/TableHeader";
import {
    filterUrlParamName,
    orderUrlParamAscValue,
    orderUrlParamDescValue,
    orderUrlParamName,
    sortUrlParamName,
} from "@/constants/urlParamNames";
import UserRoleTitles from "@/constants/userRoleTitles";
import { useURLLimit } from "@/hooks/useURLLimit";
import { useURLPageIndex } from "@/hooks/useURLPageIndex";
import { User } from "@/types/userManagement/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ColumnFiltersState,
    SortingState,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import ClientPatientTableToolbar from "./ClientPatientTableToolbar";

const filterColumnId = "data.id";

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
                            Změnit heslo
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

    const validLimitValues = [10, 20, 30];
    const { limit, setLimit } = useURLLimit({ validValues: validLimitValues });
    const { pageIndex, setPageIndex } = useURLPageIndex();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams()!;

    const columnFilters = useMemo(() => {
        const filterParam = searchParams.get(filterUrlParamName);
        return filterParam !== null
            ? [{ id: filterColumnId, value: filterParam }]
            : [];
    }, [searchParams]);

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
                limit,
                offset: pageIndex * limit,
            },
            sort:
                sorting[0] !== undefined
                    ? {
                          field: sorting[0].id,
                          order: sorting[0].desc ? "desc" : "asc",
                      }
                    : undefined,
            filters:
                columnFilters[0] !== undefined
                    ? [
                          {
                              fieldPath: columnFilters[0].id,
                              operation: "contains",
                              comparedValue: columnFilters[0].value as string,
                          },
                      ]
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
            columnFilters,
        },
        manualSorting: true,
        onSortingChange: (updaterOrValue) => {
            let newValue: SortingState;
            if (typeof updaterOrValue === "function")
                newValue = updaterOrValue(sorting);
            else newValue = updaterOrValue;

            const newParams = new URLSearchParams(searchParams);
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
        onColumnFiltersChange: (updaterOrValue) => {
            let newValue: ColumnFiltersState;
            if (typeof updaterOrValue === "function")
                newValue = updaterOrValue(columnFilters);
            else newValue = updaterOrValue;

            const newParams = new URLSearchParams(searchParams);
            if (newValue[0] !== undefined)
                newParams.set(filterUrlParamName, newValue[0].value as string);
            else newParams.delete(filterUrlParamName);

            router.replace(pathname + "?" + newParams.toString());
        },
        manualPagination: true,
        autoResetPageIndex: false,
    });

    const totalPages = Math.ceil((data?.totalCount ?? 0) / limit);
    useEffect(
        function prefetch() {
            // Prefetch next page
            const nextPageIndex = pageIndex + 1;
            if (nextPageIndex < totalPages)
                queryClient.prefetchQuery(
                    usersQuery.list({
                        formioToken: session.data?.user.formioToken!,
                        pagination: {
                            limit,
                            offset: nextPageIndex * limit,
                        },
                        sort:
                            sorting[0] !== undefined
                                ? {
                                      field: sorting[0].id,
                                      order: sorting[0].desc ? "desc" : "asc",
                                  }
                                : undefined,
                        filters:
                            columnFilters[0] !== undefined
                                ? [
                                      {
                                          fieldPath: columnFilters[0].id,
                                          operation: "contains",
                                          comparedValue: columnFilters[0]
                                              .value as string,
                                      },
                                  ]
                                : undefined,
                    })
                );
            // Prefetch previous page
            const prevPageIndex = pageIndex - 1;
            if (prevPageIndex >= 0)
                queryClient.prefetchQuery(
                    usersQuery.list({
                        formioToken: session.data?.user.formioToken!,
                        pagination: {
                            limit,
                            offset: prevPageIndex * limit,
                        },
                        sort:
                            sorting[0] !== undefined
                                ? {
                                      field: sorting[0].id,
                                      order: sorting[0].desc ? "desc" : "asc",
                                  }
                                : undefined,
                        filters:
                            columnFilters[0] !== undefined
                                ? [
                                      {
                                          fieldPath: columnFilters[0].id,
                                          operation: "contains",
                                          comparedValue: columnFilters[0]
                                              .value as string,
                                      },
                                  ]
                                : undefined,
                    })
                );
        },
        [
            limit,
            pageIndex,
            sorting,
            columnFilters,
            totalPages,
            queryClient,
            session.data?.user.formioToken,
        ]
    );

    if (isError) {
        console.error(error);
        return (
            <Alert variant="danger">Načítání seznamu uživatelů selhalo.</Alert>
        );
    }

    return (
        <>
            <ClientPatientTableToolbar
                table={table}
                filterColumnId={filterColumnId}
            />
            <div className="my-2">
                {isLoading ? (
                    <PlaceholderAppTable table={table} rowCount={limit} />
                ) : (
                    <AppTable table={table} />
                )}
            </div>
            <div className="d-flex justify-content-between align-items-center">
                <Form.Select
                    className="my-2 w-auto"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                >
                    {validLimitValues.map((pageSize: number) => (
                        <option key={pageSize} value={pageSize}>
                            Zobrazit {pageSize}
                        </option>
                    ))}
                </Form.Select>
                <SimplePagination
                    pageIndex={pageIndex}
                    totalPages={totalPages}
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
