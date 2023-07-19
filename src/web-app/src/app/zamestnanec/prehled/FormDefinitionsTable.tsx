"use client";

import ExportButton from "@/app/zamestnanec/prehled/ExportButton";
import { deleteForm, loadForms } from "@/client/formManagementClient";
import SimplePagination from "@/components/shared/SimplePagination";
import { Form as FormDefinition } from "@/types/formManagement/forms";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

export default function FormDefinitionsTable() {
    const queryClient = useQueryClient();
    const session = useSession();

    const columnHelper = createColumnHelper<FormDefinition>();
    const columns = useMemo(
        () => [
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
                            href={`/zamestnanec/formular/nahled/${props.row.original._id}`}
                        >
                            Náhled
                        </Button>
                        <Button
                            as="a"
                            href={`/zamestnanec/formular/upravit/${props.row.original._id}`}
                        >
                            Upravit
                        </Button>
                        <Button
                            disabled={!session.data?.user.formioToken}
                            onClick={async () => {
                                try {
                                    await deleteForm(
                                        session.data!.user.formioToken,
                                        props.row.original.path
                                    );
                                } catch (e) {
                                    console.error(e);
                                    toast.error("Smazání formuláře selhalo");
                                    return;
                                }
                                toast.success("Formulář byl smazán");
                                await queryClient.invalidateQueries(["forms"]);
                            }}
                            variant="danger"
                        >
                            Smazat
                        </Button>
                        <ExportButton formId={props.row.original._id} />
                        <Button
                            as="a"
                            href={`/zamestnanec/formular/vysledky/${props.row.original._id}`}
                        >
                            Výsledky
                        </Button>
                    </div>
                ),
            }),
        ],
        [columnHelper, queryClient, session.data]
    );

    const { isLoading, isError, error, data } = useQuery({
        queryKey: ["forms", session.data],
        queryFn: () =>
            loadForms(session.data!.user.formioToken, ["klientPacient"]),
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
        </>
    );
}
