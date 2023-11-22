"use client";

import { formsQuery } from "@/client/queries/formManagement";
import { usersQuery } from "@/client/queries/userManagement";
import AppTable from "@/components/AppTable";
import PlaceholderAppTable from "@/components/PlaceholderAppTable";
import SimplePagination from "@/components/SimplePagination";
import TableHeader from "@/components/TableHeader";
import {
    filterColumnIdUrlParamName,
    filterUrlParamName,
    orderUrlParamAscValue,
    orderUrlParamDescValue,
    orderUrlParamName,
    sortUrlParamName,
} from "@/constants/urlParamNames";
import { useURLLimit } from "@/hooks/useURLLimit";
import { useURLPageIndex } from "@/hooks/useURLPageIndex";
import { Form as FormFormio } from "@/types/formManagement/forms";
import {
    DataValue,
    SelectBoxDataValue,
    Submission,
} from "@/types/formManagement/submission";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ColumnFiltersState,
    SortingState,
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Alert, Form } from "react-bootstrap";
import ResultTableToolbar from "./ResultTableToolbar";
import stringifyResult from "./toolbar-items/stringifyResult";

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

    const validLimitValues = useMemo(() => [10, 20, 30], []);
    const { limit, setLimit } = useURLLimit({ validValues: validLimitValues });
    const { pageIndex, setPageIndex } = useURLPageIndex();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams()!;

    const filterColumnId = searchParams.get(filterColumnIdUrlParamName) ?? "";

    const columnFilters = useMemo(() => {
        const filterParam = searchParams.get(filterUrlParamName) ?? "";
        return filterParam !== "" && filterColumnId !== ""
            ? [{ id: filterColumnId, value: filterParam }]
            : [];
    }, [searchParams, filterColumnId]);

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
        data: submissionsQueryData,
        isError: isErrorSubmissions,
        error: errorSubmissions,
        isLoading: isLoadingSubmissions,
    } = useQuery({
        ...formsQuery.submissions(formId, {
            formioToken: data?.user.formioToken!,
            pagination: { limit: limit, offset: limit * pageIndex },
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
        enabled: !!data && !!form,
    });
    const rawSubmissions = submissionsQueryData?.data;

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

    const dataVisualizationKeyLabelMap = useMemo(
        () =>
            Object.fromEntries(
                form?.components
                    ?.filter((c) => c.type !== "button" && c.key !== "taskId")
                    ?.map(({ key, label }) => [key, label]) ?? []
            ),
        [form]
    );

    const filterPathLabelMap = useMemo(
        () =>
            Object.fromEntries(
                form?.components
                    ?.filter((c) => c.type !== "button")
                    .map((c) => [`data.${c.key}`, c.label]) ?? []
            ),
        [form]
    );

    const totalPages = Math.ceil(
        (submissionsQueryData?.totalCount ?? 0) / limit
    );

    const queryClient = useQueryClient();
    useEffect(
        function prefetch() {
            // Prefetch next page
            const nextPageIndex = pageIndex + 1;
            if (nextPageIndex < totalPages)
                queryClient.prefetchQuery(
                    formsQuery.submissions(formId, {
                        formioToken: data?.user.formioToken!,
                        pagination: {
                            limit: limit,
                            offset: limit * nextPageIndex,
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
                    formsQuery.submissions(formId, {
                        formioToken: data?.user.formioToken!,
                        pagination: {
                            limit: limit,
                            offset: limit * prevPageIndex,
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
            formId,
            data?.user.formioToken,
        ]
    );

    const columnHelper =
        createColumnHelper<Exclude<typeof tableData, undefined>[number]>();
    const columns = useMemo(() => {
        const cols = [
            columnHelper.accessor("owner", {
                id: "owner",
                meta: { viewOptionsLabel: "Autor" },
                header: ({ column }) => (
                    <TableHeader text="Autor" column={column} />
                ),
                cell: (props) => props.row.original.ownerDisplayId,
            }),
            columnHelper.accessor("created", {
                id: "created",
                meta: { viewOptionsLabel: "Vytvořeno dne" },
                header: ({ column }) => (
                    <TableHeader text="Vytvořeno dne" column={column} />
                ),
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
                            id: `data.${comp.key}`,
                            meta: { viewOptionsLabel: comp.label },
                            header: ({ column }) => (
                                <TableHeader
                                    text={comp.label}
                                    column={column}
                                />
                            ),
                            cell: (props) => {
                                const value =
                                    props.row.original.data[comp.key]?.value ??
                                    "Chybějící hodnota";
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
        manualPagination: true,
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
        manualFiltering: true,
        onColumnFiltersChange: (updaterOrValue) => {
            let newValue: ColumnFiltersState;
            if (typeof updaterOrValue === "function")
                newValue = updaterOrValue(columnFilters);
            else newValue = updaterOrValue;

            const newParams = new URLSearchParams(searchParams);
            if (newValue[0] !== undefined) {
                newParams.set(filterUrlParamName, newValue[0].value as string);
            } else {
                newParams.delete(filterUrlParamName);
            }

            router.replace(pathname + "?" + newParams.toString());
        },
        autoResetPageIndex: false,
    });

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
            <h1>Výsledky formuláře - {form?.title ?? "Načítání..."}</h1>
            <ResultTableToolbar
                formId={formId}
                frequencyVisualizationProps={{
                    data: labeledSubmissions.map((s) => s.data),
                    keyLabelMap: dataVisualizationKeyLabelMap,
                }}
                table={table}
                filterProps={{
                    placeholder: "",
                    columnId: filterColumnId,
                    pathLabelMap: filterPathLabelMap,
                }}
            />
            <div className="my-2">
                {isLoadingSubmissions || isLoadingForm ? (
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
