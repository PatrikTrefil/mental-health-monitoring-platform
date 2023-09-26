"use client";

import ExportButton from "@/app/zamestnanec/sprava-formularu/ExportButton";
import { deleteFormById } from "@/client/formManagementClient";
import { formsQuery } from "@/client/queries/formManagement";
import TableHeader from "@/components/TableHeader";
import SimplePagination from "@/components/shared/SimplePagination";
import {
    orderUrlParamAscValue,
    orderUrlParamDescValue,
    orderUrlParamName,
    sortUrlParamName,
} from "@/constants/urlSort";
import { Form as FormDefinition } from "@/types/formManagement/forms";
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
import { Alert, Button, Form, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import FormTableToolbar from "./FormTableToolbar";

const defaultPageSize = 10;

/**
 * Table of form definitions available to clients/patients.
 */
export default function FormDefinitionsTable() {
    const queryClient = useQueryClient();
    const session = useSession();

    const { mutate: deleteFormMutate } = useMutation({
        mutationFn: async ({
            formId,
            formioToken,
        }: {
            formId: string;
            formioToken: string;
        }) => {
            await deleteFormById(formioToken, formId);
        },
        onMutate: ({ formId }) => {
            console.debug("Deleting form...", { formPath: formId });
        },
        onError: (e: unknown, { formId }) => {
            console.error("Failed to delete form.", {
                error: e,
                formPath: formId,
            });
            toast.error("Smazání formuláře selhalo.");
        },
        onSuccess: (_, { formId }) => {
            console.debug("Form deleted.", { formId });
            queryClient.invalidateQueries({
                queryKey: formsQuery._def,
            });
            queryClient.invalidateQueries({
                queryKey: formsQuery.detail(
                    session.data?.user.formioToken!,
                    formId
                ).queryKey,
            });
            toast.success("Formulář byl smazán");
        },
    });

    const columnHelper = createColumnHelper<FormDefinition>();
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
            columnHelper.accessor("name", {
                id: "name",
                header: ({ column }) => (
                    <TableHeader text="Název" column={column} />
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
                    <div className="d-flex align-items-center gap-2">
                        <Button
                            as="a"
                            href={`/zamestnanec/formular/${props.row.original._id}/nahled`}
                        >
                            Náhled
                        </Button>
                        <Button
                            as="a"
                            href={`/zamestnanec/formular/${props.row.original._id}/upravit`}
                        >
                            Upravit
                        </Button>
                        <Button
                            disabled={!session.data}
                            onClick={async () => {
                                props.row.toggleSelected(false);
                                deleteFormMutate({
                                    formioToken: session.data!.user.formioToken,
                                    formId: props.row.original._id,
                                });
                            }}
                            variant="danger"
                        >
                            Smazat
                        </Button>
                        <ExportButton formId={props.row.original._id} />
                        <Button
                            as="a"
                            href={`/zamestnanec/formular/${props.row.original._id}/vysledek`}
                        >
                            Výsledky
                        </Button>
                    </div>
                ),
            }),
        ],
        [columnHelper, deleteFormMutate, session.data]
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
        ...formsQuery.list({
            formioToken: session.data?.user.formioToken!,
            pagination: {
                limit: pageSize,
                offset: pageSize * pageIndex,
            },
            sort:
                sorting[0] !== undefined
                    ? {
                          field: sorting[0].id as keyof FormDefinition,
                          order: sorting[0].desc ? "desc" : "asc",
                      }
                    : undefined,
            tags: ["klientPacient"],
        }),
        enabled: !!session.data?.user.formioToken,
    });

    const table = useReactTable({
        columns,
        data: data?.data ?? [],
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
        getCoreRowModel: getCoreRowModel(),
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
            <Alert variant="danger">Načítání seznamu formulářů selhalo.</Alert>
        );
    }

    return (
        <>
            <FormTableToolbar table={table} />
            <div className="mt-2 d-block text-nowrap overflow-auto w-100">
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
                    {[10, 20, 30].map((currPageSize: number) => (
                        <option key={currPageSize} value={currPageSize}>
                            Zobrazit {currPageSize}
                        </option>
                    ))}
                </Form.Select>
                <SimplePagination
                    pageIndex={pageIndex}
                    totalPages={Math.ceil(data.totalCount / pageSize)}
                    setPageIndex={setPageIndex}
                />
            </div>
        </>
    );
}
