"use client";

import ExportButton from "@/app/zamestnanec/sprava-formularu/ExportButton";
import { deleteFormById } from "@/client/formManagementClient";
import { formsQuery } from "@/client/queries/formManagement";
import SimplePagination from "@/components/shared/SimplePagination";
import { Form as FormDefinition } from "@/types/formManagement/forms";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { Alert, Button, Form, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import FormTableToolbar from "./FormTableToolbar";

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
                queryKey: formsQuery.list(session.data?.user.formioToken!)
                    .queryKey,
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
                header: "Název",
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

    const { isLoading, isError, error, data } = useQuery({
        ...formsQuery.list(session.data?.user.formioToken!, ["klientPacient"]),
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
        </>
    );
}
