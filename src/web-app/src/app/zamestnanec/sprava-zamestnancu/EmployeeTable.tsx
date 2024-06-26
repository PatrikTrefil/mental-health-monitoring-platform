"use client";

import {
    assignerQuery,
    employeeQuery,
    formManagerQuery,
} from "@/client/queries/userManagement";
import { deleteUser } from "@/client/userManagementClient";
import AppTable from "@/components/AppTable";
import ChangePasswordUser from "@/components/ChangePasswordUser";
import PlaceholderAppTable from "@/components/PlaceholderAppTable";
import TableHeader from "@/components/TableHeader";
import {
    filterUrlParamName,
    orderUrlParamAscValue,
    orderUrlParamDescValue,
    orderUrlParamName,
    sortUrlParamName,
} from "@/constants/urlParamNames";
import UserRoleTitles from "@/constants/userRoleTitles";
import { UserRoleTitle } from "@/types/userManagement/UserRoleTitle";
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import {
    ColumnFiltersState,
    SortingState,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert, Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import EmployeeTableToolbar from "./EmployeeTableToolbar";

const pageSize = 10;
const filterColumnId = "data.id";

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
            deleteUser(userSubmissionId, userRoleTitle, formioToken);
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
        onSuccess: (_, { userSubmissionId, userRoleTitle }) => {
            console.debug("Employee deleted.", {
                userSubmissionId,
            });
            queryClient.invalidateQueries({
                queryKey: employeeQuery.infiniteList._def,
            });
            if (userRoleTitle === UserRoleTitles.FORM_MANAGER)
                queryClient.invalidateQueries({
                    queryKey: formManagerQuery.list._def,
                });
            else if (userRoleTitle === UserRoleTitles.ASSIGNER)
                queryClient.invalidateQueries({
                    queryKey: assignerQuery.list._def,
                });
            else
                throw new Error(`Unexpected user role title: ${userRoleTitle}`);
        },
    });

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

    const {
        isLoading,
        isError,
        error,
        data: employees,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        ...employeeQuery.infiniteList({
            formioToken: session.data?.user.formioToken!,
            sorting,
            pageSize,
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
        getNextPageParam: (lastPage) =>
            lastPage.nextPageParam.nextPageFormManagerOffset !== undefined ||
            lastPage.nextPageParam.nextPageAssignerOffset !== undefined
                ? lastPage.nextPageParam
                : undefined,
    });

    const tableData = useMemo(
        function flattenEmployeesPages() {
            return employees?.pages.flatMap((item) => item.data) ?? [];
        },
        [employees]
    );

    const columnHelper = createColumnHelper<(typeof tableData)[number]>();
    const columns = useMemo(
        () => [
            columnHelper.accessor("data.id", {
                id: "data.id",
                header: ({ column }) => (
                    <TableHeader text="ID" column={column} />
                ),
                cell: (props) => {
                    return (
                        <>
                            {props.row.original.data.id}{" "}
                            <i>
                                ({props.row.original.mainUserRoleTitle ?? "-"})
                            </i>
                        </>
                    );
                },
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
                cell: (props) => {
                    const isOwnAccount =
                        props.row.original._id === session?.data?.user._id;
                    const actionNodes: React.ReactNode[] = [];

                    const roleTitlesCurrentUser = session.data?.user.roleTitles;
                    if (
                        roleTitlesCurrentUser?.includes(
                            UserRoleTitles.FORM_MANAGER
                        ) ||
                        (roleTitlesCurrentUser?.includes(
                            UserRoleTitles.ASSIGNER
                        ) &&
                            props.row.original.mainUserRoleTitle ===
                                UserRoleTitles.ASSIGNER)
                    ) {
                        actionNodes.push(
                            <Button
                                key="delete-button"
                                variant="danger"
                                disabled={!session.data}
                                onClick={async () => {
                                    deleteEmployeeMutate({
                                        userSubmissionId:
                                            props.row.original._id,
                                        userRoleTitle:
                                            props.row.original
                                                .mainUserRoleTitle,
                                        formioToken:
                                            session.data!.user.formioToken,
                                    });

                                    if (isOwnAccount) await signOut();
                                }}
                            >
                                Smazat {isOwnAccount && "vlastní účet"}
                            </Button>
                        );
                        actionNodes.push(
                            <Button
                                key="edit-button"
                                onClick={() => {
                                    setUserToEdit({
                                        submissionId: props.row.original._id,
                                        userId: props.row.original.data.id,
                                        roleTitle:
                                            props.row.original
                                                .mainUserRoleTitle,
                                    });
                                }}
                            >
                                Změnit heslo {isOwnAccount && "vlastního účtu"}
                            </Button>
                        );
                    }
                    return <div className="d-flex gap-2">{...actionNodes}</div>;
                },
            }),
        ],
        [columnHelper, session.data, deleteEmployeeMutate]
    );

    const table = useReactTable({
        columns,
        data: tableData,
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
    });

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
            <EmployeeTableToolbar
                table={table}
                filterProps={{
                    columnId: filterColumnId,
                    placeholder: "Filtrovat dle ID",
                }}
            />
            <div className="my-2">
                {isLoading ? (
                    <PlaceholderAppTable table={table} rowCount={pageSize} />
                ) : (
                    <AppTable table={table} />
                )}
            </div>
            <div className="d-flex justify-content-center align-items-center mb-4 mt-1">
                <Button
                    size="lg"
                    disabled={!hasNextPage}
                    variant={hasNextPage ? "primary" : "secondary"}
                    onClick={() => fetchNextPage()}
                >
                    Načíst další
                </Button>
            </div>
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
