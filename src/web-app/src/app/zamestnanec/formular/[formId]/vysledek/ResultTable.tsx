"use client";

import { formsQuery } from "@/client/queries/formManagement";
import { usersQuery } from "@/client/queries/userManagement";
import SimplePagination from "@/components/shared/SimplePagination";
import { Form as FormFormio } from "@/types/formManagement/forms";
import {
    DataValue,
    SelectBoxDataValue,
    Submission,
} from "@/types/formManagement/submission";
import { useQueries, useQuery } from "@tanstack/react-query";
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
 * Display table with results from form with given formId.
 * @param root0 - Props for the component.
 * @param root0.formId - ID of the form to display results of.
 */
export default function ResultTable({ formId }: { formId: string }) {
    const { data } = useSession();

    // We need the form object to get path of the form to load submissions
    const {
        data: form,
        isError: isErrorForm,
        error: errorForm,
        isLoading: isLoadingForm,
    } = useQuery({
        ...formsQuery.detail(data?.user.formioToken!, formId),
        enabled: !!data?.user.formioToken,
    });

    const {
        data: rawSubmissions,
        isError: isErrorSubmissions,
        error: errorSubmissions,
        isLoading: isLoadingSubmissions,
    } = useQuery({
        ...formsQuery.submissions(data?.user.formioToken!, formId),
        enabled: !!data && !!form,
    });

    const labeledSubmissions = useMemo(
        () =>
            rawSubmissions !== undefined && form !== undefined && form !== null
                ? addHumanReadableLabelsToSubmissionData(rawSubmissions, form)
                : [],
        [rawSubmissions, form]
    );

    const userIdsToLoad = useMemo(() => {
        if (rawSubmissions === undefined) return [];
        return Array.from(
            new Set<string>(
                rawSubmissions.map((submission) => submission.owner)
            )
        );
    }, [rawSubmissions]);

    // We need to load users to display their names in table
    const users = useQueries({
        queries: userIdsToLoad.map((userId) => ({
            ...usersQuery.detail(data?.user.formioToken!, userId),
            enabled: !!data?.user.formioToken,
        })),
    });

    const userIdUserDisplayNameMap = useMemo(() => {
        if (users === undefined) return new Map<string, string>();
        return new Map(
            users.map((user) => [user.data?._id, user.data?.data.id])
        );
    }, [users]);

    const tableData = useMemo(() => {
        return labeledSubmissions?.map((submission) => ({
            ...submission,
            ownerDisplayId:
                userIdUserDisplayNameMap.get(submission.owner) ?? "Neznámý",
        }));
    }, [labeledSubmissions, userIdUserDisplayNameMap]);

    const columnHelper =
        createColumnHelper<Exclude<typeof tableData, undefined>[number]>();
    const columns = useMemo(() => {
        const cols = [
            columnHelper.accessor("owner", {
                header: "Autor",
                cell: (props) => props.row.original.ownerDisplayId,
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
                            cell: (props) => {
                                const value =
                                    props.row.original.data[comp.key]?.value;
                                if (value === undefined)
                                    throw new Error("Unexpected undefined");
                                return stringifyResult(value);
                            },
                        }
                    )
                );
            }
        return cols;
    }, [columnHelper, form?.components]);

    const table = useReactTable({
        columns,
        data: tableData ?? [],
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

    if (isErrorForm) {
        console.error(errorForm);
        return <Alert variant="danger">Nepodařilo se načíst data.</Alert>;
    }

    if (form === null) {
        return <Alert variant="danger">Formulář neexistuje.</Alert>;
    }

    if (isErrorSubmissions) {
        if (isErrorSubmissions) console.error(errorSubmissions);

        return (
            <Alert variant="danger">
                Nepodařilo se načíst vyplnění formuláře
            </Alert>
        );
    }

    return (
        <>
            <h1>Výsledky formuláře - {form.title}</h1>
            <FrequencyVisualization
                data={labeledSubmissions.map((s) => s.data)}
                labelKeyMap={Object.fromEntries(
                    form.components
                        .filter(
                            (c) => c.type !== "button" && c.key !== "taskId"
                        )
                        .map((c) => [c.key, c.label])
                )}
            />

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
                                    <td key={cell.id} className="align-middle">
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
 * Adds human readable labels to every data entry of every submission.
 * The value is replaced by an object containing the value and the label.
 * @param submissions - Submissions to which the labels are added to.
 * @param form - Form to get the labels from.
 * @returns Submissions where every data entry has a label.
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
