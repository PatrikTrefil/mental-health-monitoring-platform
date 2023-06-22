"use client";

import {
    loadFormById,
    loadSubmissions,
    loadUsers,
} from "@/client/formioClient";
import SimplePagination from "@/components/shared/SimplePagination";
import { useSmartFetch } from "@/hooks/useSmartFetch";
import { Form as FormFormio } from "@/types/forms";
import { Submission } from "@/types/submission";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";
import { Alert, Form, Spinner, Table } from "react-bootstrap";
import FrequencyVisualization from "./FrequencyVisualization";
import stringifyResult from "./stringifyResult";

/**
 * Display table with results from form with given formId
 */
export default function ResultTable({ formId }: { formId: string }) {
    const { data } = useSession();

    const {
        data: users,
        isError: isErrorUsers,
        error: errorUsers,
    } = useSmartFetch({
        queryFn: () => loadUsers(data!.user.formioToken),
        enabled: !!data,
    });

    const {
        data: form,
        isError: isErrorForm,
        error: errorForm,
        isLoading: isLoadingForm,
    } = useSmartFetch<FormFormio, string>({
        queryFn: async () => {
            const form = await loadFormById(formId, data!.user.formioToken);
            if (!form) throw "Formulář s předaným ID nebyl nalezen";

            return form;
        },
        enabled: !!data,
    });

    const {
        data: submissions,
        isError: isErrorSubmissions,
        error: errorSubmissions,
        isLoading: isLoadingSubmissions,
    } = useSmartFetch({
        queryFn: async () => {
            const submissions = await loadSubmissions(
                form!.path,
                data!.user.formioToken
            );
            const labeledSubmissions = submissions.map((submission) => {
                return {
                    ...submission,
                    data: Object.fromEntries(
                        form!.components.map((c) => {
                            if (c.type === "selectboxes") {
                                return [
                                    c.key,
                                    {
                                        value: (
                                            c?.values as {
                                                value: string;
                                                label: string;
                                            }[]
                                        ).map((v) => {
                                            if (submission.data[c.key])
                                                return {
                                                    value: (
                                                        submission.data[
                                                            c.key
                                                        ] as any
                                                    )[v.value],
                                                    label: v.label,
                                                };
                                            else
                                                return {
                                                    value: null,
                                                    label: v.label,
                                                };
                                        }),
                                        label: c.label,
                                    },
                                ];
                            }
                            return [
                                c.key,
                                {
                                    value: submission.data[c.key],
                                    label: c.label,
                                },
                            ];
                        })
                    ),
                };
            });
            return labeledSubmissions;
        },
        enabled: !!data && !!form,
    });

    const columnHelper =
        createColumnHelper<Exclude<typeof submissions, null>[number]>();
    const columns = useMemo(() => {
        const cols = [
            columnHelper.accessor("owner", {
                header: "Autor",
                cell: (props) =>
                    users?.find((user) => user._id === props.row.original.owner)
                        ?.data?.id ?? "Načítání...",
            }),
            columnHelper.accessor("created", {
                header: "Vytvořeno dne",
                cell: (props) =>
                    new Date(props.row.original.created).toLocaleString(),
            }),
        ];
        if (form?.components)
            for (const comp of form.components) {
                // ignore submit button
                if (comp.type === "button") continue;

                cols.push(
                    columnHelper.accessor(
                        `data.${comp.key}` as keyof Submission,
                        {
                            header: comp.label,
                            cell: (props) =>
                                stringifyResult(
                                    props.row.original.data[comp.key].value
                                ),
                        }
                    )
                );
            }
        return cols;
    }, [columnHelper, form, users]);

    useEffect(() => {
        console.log(submissions);
    }, [submissions]);

    useEffect(() => {
        console.log(form);
    }, [form]);

    const table = useReactTable({
        columns,
        data: submissions ?? [],
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (isLoadingSubmissions || isLoadingForm)
        return (
            <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Načítání...</span>
                </Spinner>
            </div>
        );

    if (isErrorForm) return <Alert variant="danger">{errorForm}</Alert>;

    if (isErrorSubmissions || isErrorUsers) {
        if (isErrorUsers) console.error(errorUsers);
        else if (isErrorSubmissions) console.error(errorSubmissions);

        return (
            <Alert variant="danger">
                Nepodařilo se načíst vyplnění formuláře
            </Alert>
        );
    }

    return (
        <>
            <FrequencyVisualization
                data={submissions.map((s) => s.data)}
                labelKeyMap={Object.fromEntries(
                    form.components
                        .filter(
                            (c) => c.type !== "button" && c.key !== "taskId"
                        )
                        .map((c) => [c.key, c.label])
                )}
            />

            <p>Název formuláře: {form.title}</p>
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
            <div className="my-2 d-block text-nowrap overflow-auto w-100">
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
        </>
    );
}
