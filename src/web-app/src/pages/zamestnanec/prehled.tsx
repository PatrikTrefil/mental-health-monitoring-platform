import CurrentUserDetails from "@/components/shared/CurrentUserDetails";
import LogoutButton from "@/components/shared/LogoutButton";
import SimplePagination from "@/components/shared/SimplePagination";
import ExportButton from "@/components/zamestnanec/ExportButton";
import { Form as FormDefinition } from "@/types/form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useCallback, useMemo } from "react";
import { Alert, Button, Form, Spinner, Table } from "react-bootstrap";

/**
 * Prehled (dashboard) page for employees.
 */
export default function PrehledPage() {
    return (
        <>
            <Head>
                <title>Zaměstnanec - přehled</title>
            </Head>
            <main>
                <h1>Zaměstnanec - přehled</h1>
                <CurrentUserDetails />
                <LogoutButton />
                <div className="d-flex flex-wrap gap-2 mt-2">
                    <Button as="a" href="/zamestnanec/formular/vytvorit">
                        Vytvořit formulář
                    </Button>
                    <Button as="a" href="./registrace-zamestnance">
                        Založit účet nového zaměstnance
                    </Button>
                    <Button as="a" href="./sprava-klientu-pacientu">
                        Správa klientů/pacientů
                    </Button>
                </div>
                <div>
                    <h2>Definice formulářů</h2>
                    <FormDefinitionsTable />
                </div>
            </main>
        </>
    );
}

function FormDefinitionsTable() {
    const queryClient = useQueryClient();
    const session = useSession();

    const deleteForm = useCallback(
        async (formPath: string) => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}${formPath}`,
                {
                    method: "DELETE",
                    headers: {
                        "x-jwt-token": session.data!.user.formioToken,
                    },
                }
            );
            if (!response.ok) {
                // TODO: handle error
                console.error("Failed to delete form", {
                    status: response.status,
                });
            }
            await queryClient.invalidateQueries(["forms"]);
        },
        [queryClient, session.data]
    );

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
                            onClick={() => deleteForm(props.row.original.path)}
                            variant="danger"
                        >
                            Smazat
                        </Button>
                        <ExportButton formId={props.row.original._id} />
                    </div>
                ),
            }),
        ],
        [columnHelper, deleteForm]
    );

    const fetchForms = useCallback(async () => {
        const url = new URL(`${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}form/`);
        url.searchParams.set("type", "form");
        url.searchParams.set("tags", "klientPacient");

        const response = await fetch(url, {
            headers: {
                "x-jwt-token": session.data!.user.formioToken, // token won't be null, because the query is disabled when it is
            },
        });

        return (await response.json()) as FormDefinition[];
    }, [session.data]);

    const { isLoading, isError, error, data, isFetching, refetch } = useQuery({
        queryKey: ["forms"],
        queryFn: () => fetchForms(),
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
            <Table striped bordered hover className="my-2">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
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
            <div className="d-flex justify-content-center align-items-center">
                <SimplePagination
                    pageIndex={table.getState().pagination.pageIndex}
                    totalPages={table.getPageCount()}
                    setPageIndex={table.setPageIndex}
                />
            </div>
        </>
    );
}
