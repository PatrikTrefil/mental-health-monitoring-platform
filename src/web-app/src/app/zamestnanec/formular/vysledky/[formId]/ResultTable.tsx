"use client";

import {
    loadFormById,
    loadSubmissions,
    loadUsers,
} from "@/client/formioClient";
import SimplePagination from "@/components/shared/SimplePagination";
import { useSmartFetch } from "@/hooks/useSmartFetch";
import { Form as FormFormio } from "@/types/forms";
import { DataValue, SelectBoxDataValue, Submission } from "@/types/submission";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { Alert, Form, Spinner, Table } from "react-bootstrap";
import FrequencyVisualization from "./FrequencyVisualization";
import stringifyResult from "./stringifyResult";

/**
 * Display table with results from form with given formId
 */
export default function ResultTable({ formId }: { formId: string }) {
    const { data } = useSession();

    // We need to load users to display their names in table
    const {
        data: users,
        isError: isErrorUsers,
        error: errorUsers,
    } = useSmartFetch({
        queryFn: () => loadUsers(data!.user.formioToken),
        enabled: !!data,
    });

    // We need the form object to get path of the form to load submissions
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
            return addHumanReadableLabelsToSubmissionData(submissions, form!);
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

export type LabeledDataValue = {
    value:
        | Exclude<DataValue, SelectBoxDataValue>
        | {
              value: boolean | null;
              label: string;
          }[];
    label: string;
};

/**
 * Add human readable labels to every data entry of every submission
 * @param submissions submissions to add labels to
 * @param form form to get labels from
 * @returns submissions where every data entry has a label
 */
function addHumanReadableLabelsToSubmissionData(
    submissions: Submission[],
    form: FormFormio
): (Omit<Submission, "data"> & {
    data: { [key: string]: LabeledDataValue };
})[] {
    return submissions.map((submission) => {
        const labeledData = form!.components.map<[string, LabeledDataValue]>(
            (c) => {
                let dataValue: LabeledDataValue;
                // assign label to the whole selectbox and
                // assign labels to every value of selectbox
                if (c.type === "selectboxes") {
                    dataValue = {
                        value: c.values.map((v) => {
                            if (submission.data[c.key])
                                return {
                                    value: (
                                        submission.data[
                                            c.key
                                        ] as SelectBoxDataValue
                                    )[v.value]!,
                                    label: v.label,
                                };
                            else
                                return {
                                    value: null,
                                    label: v.label,
                                };
                        }),
                        label: c.label,
                    };
                } else {
                    dataValue = {
                        value: submission.data[c.key] as Exclude<
                            DataValue,
                            SelectBoxDataValue
                        >,
                        label: c.label,
                    };
                }
                return [c.key, dataValue];
            }
        );
        return {
            ...submission,
            data: Object.fromEntries(labeledData),
        };
    });
}
