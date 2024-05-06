import { createQueryKeys } from "@lukemorales/query-key-factory";
import { SortingState } from "@tanstack/react-table";
import {
    loadAssignee,
    loadAssignees,
    loadAssigners,
    loadFormManager,
    loadRoles,
} from "../userManagementClient";

export const assigneeQuery = createQueryKeys("assignee", {
    list: ({
        formioToken,
        pagination,
        sort,
        filters,
    }: {
        formioToken: string;
        pagination: { limit: number; offset: number };
        sort?: { field: string; order: "asc" | "desc" };
        filters?: {
            fieldPath: string;
            operation: "contains";
            comparedValue: string;
        }[];
    }) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ["list", pagination, sort, filters],
        queryFn: () =>
            loadAssignees({
                token: formioToken,
                pagination,
                sort,
                filters,
            }),
    }),
    detail: (formioToken: string, userSubmissionId: string) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: [userSubmissionId],
        queryFn: () => loadAssignee(userSubmissionId, formioToken),
    }),
});

export const assignerQuery = createQueryKeys("assigner", {
    list: ({
        formioToken,
        pagination,
        sort,
    }: {
        formioToken: string;
        pagination: { limit: number; offset: number };
        sort?: { field: string; order: "asc" | "desc" };
    }) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ["list", pagination, sort],
        queryFn: () => loadAssigners({ token: formioToken, pagination, sort }),
    }),
});

export const formManagerQuery = createQueryKeys("formManager", {
    list: ({
        formioToken,
        pagination,
        sort,
    }: {
        formioToken: string;
        pagination: { limit: number; offset: number };
        sort?: { field: string; order: "asc" | "desc" };
    }) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ["list", pagination, sort],
        queryFn: () =>
            loadFormManager({ token: formioToken, pagination, sort }),
    }),
});

export const rolesQuery = createQueryKeys("roles", {
    list: (formioToken: string) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ["roles"], // Needs to be non-empty
        queryFn: () => loadRoles(formioToken),
    }),
});

export const employeeQuery = createQueryKeys("employee", {
    infiniteList: ({
        formioToken,
        pageSize,
        sorting,
        filters,
    }: {
        formioToken: string;
        pageSize: number;
        sorting: SortingState;
        filters?: {
            fieldPath: string;
            operation: "contains";
            comparedValue: string;
        }[];
    }) => ({
        queryFn: async ({ pageParam }) => {
            /**
             * If the offset is undefined, there are no more pages to load.
             */
            let offsetFormManager: number | undefined;
            /**
             * If the offset is undefined, there are no more pages to load.
             */
            let offsetAssigner: number | undefined;

            // When the first query is made, the param is not present
            const isFirstPage = pageParam === undefined;
            if (isFirstPage) {
                offsetFormManager = 0;
                offsetAssigner = 0;
            } else {
                offsetFormManager = pageParam.nextPageFormManagerOffset;
                offsetAssigner = pageParam.nextPageAssignerOffset;
            }
            const formManagersPromise =
                offsetFormManager !== undefined
                    ? loadFormManager({
                          token: formioToken,
                          pagination: {
                              limit: pageSize,
                              offset: offsetFormManager,
                          },
                          sort:
                              sorting[0] !== undefined
                                  ? {
                                        field: sorting[0].id,
                                        order: sorting[0].desc ? "desc" : "asc",
                                    }
                                  : undefined,
                          filters,
                      })
                    : new Promise<undefined>((resolve) => resolve(undefined));
            const assignersPromise =
                offsetAssigner !== undefined
                    ? loadAssigners({
                          token: formioToken,
                          pagination: {
                              limit: pageSize,
                              offset: offsetAssigner,
                          },
                          sort:
                              sorting[0] !== undefined
                                  ? {
                                        field: sorting[0].id,
                                        order: sorting[0].desc ? "desc" : "asc",
                                    }
                                  : undefined,
                          filters,
                      })
                    : new Promise<undefined>((resolve) => resolve(undefined));

            const [dataFormManagers, dataAssigners] = await Promise.all([
                formManagersPromise,
                assignersPromise,
            ]);

            const {
                resData,
                nextPageOffsetA: nextPageFormManagerOffset,
                nextPageOffsetB: nextPageAssignerOffset,
            } = mergeSortedPaginatedData(dataFormManagers, dataAssigners, {
                pageSize,
                sorting,
                offsetA: offsetFormManager,
                offsetB: offsetAssigner,
            });

            return {
                data: resData,
                nextPageParam: {
                    nextPageFormManagerOffset,
                    nextPageAssignerOffset,
                },
            };
        },
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ["infiniteList", sorting, filters, pageSize],
    }),
});

/**
 * Merge sorted data from two sources and calculate offsets for the next page.
 * @param dataA - The first source of data.
 * @param dataB - The second source of data.
 * @param root0 - Other parameters.
 * @param root0.pageSize - The size of a single page of data.
 * @param root0.sorting - Sorting configuration.
 * @param root0.offsetA - The offset of the first source of data.
 * @param root0.offsetB - The offset of the second source of data.
 */
function mergeSortedPaginatedData<TData>(
    dataA: { data: TData[]; totalCount: number } | undefined,
    dataB: { data: TData[]; totalCount: number } | undefined,
    {
        pageSize,
        sorting,
        offsetA,
        offsetB,
    }: {
        pageSize: number;
        sorting: SortingState;
        offsetA: number | undefined;
        offsetB: number | undefined;
    }
): {
    resData: TData[];
    nextPageOffsetA: number | undefined;
    nextPageOffsetB: number | undefined;
} {
    console.debug("Merging data...", {
        dataFormManagers: dataA,
        dataAssigners: dataB,
        sorting,
        pageSize,
    });
    let resData: TData[] = [];

    /**
     * If the offset is undefined, there are no more pages to load.
     */
    let nextPageOffsetA: number | undefined;
    /**
     * If the offset is undefined, there are no more pages to load.
     */
    let nextPageOffsetB: number | undefined;

    if (dataA === undefined && dataB !== undefined) {
        resData = dataB.data;
        const wouldBeNextPageOffsetB = offsetB! + dataB.data.length;
        nextPageOffsetB =
            wouldBeNextPageOffsetB < dataB.totalCount
                ? wouldBeNextPageOffsetB
                : undefined;
    } else if (dataA !== undefined && dataB === undefined) {
        resData = dataA.data;
        const wouldBeNextPageOffsetA = offsetA! + dataA.data.length;
        nextPageOffsetA =
            wouldBeNextPageOffsetA < dataA.totalCount
                ? wouldBeNextPageOffsetA
                : undefined;
    } else if (dataA !== undefined && dataB !== undefined) {
        let indexDataA = 0;
        let indexDataB = 0;
        while (resData.length < pageSize) {
            const isDataAExhausted = indexDataA >= dataA.data.length;
            if (isDataAExhausted) {
                for (; indexDataB < dataB.data.length; indexDataB++) {
                    resData.push(dataB.data[indexDataB]!);
                }
                break;
            }
            const isDataBExhausted = indexDataB >= dataB.data.length;
            if (isDataBExhausted) {
                for (; indexDataA < dataA.data.length; indexDataA++) {
                    resData.push(dataA.data[indexDataA]!);
                }
                break;
            }
            if (sorting[0] !== undefined) {
                let dataAValue = accessNestedValue(
                    dataA.data[indexDataA],
                    sorting[0].id
                );
                let dataBValue = accessNestedValue(
                    dataB.data[indexDataB],
                    sorting[0].id
                );
                if (sorting[0].desc)
                    resData.push(
                        (dataAValue as any) > (dataBValue as any)
                            ? dataA.data[indexDataA++]!
                            : dataB.data[indexDataB++]!
                    );
                else
                    resData.push(
                        (dataAValue as any) < (dataBValue as any)
                            ? dataA.data[indexDataA++]!
                            : dataB.data[indexDataB++]!
                    );
            } else {
                resData.push(dataA.data[indexDataA++]!);
            }
        }
        const wouldBeNextPageOffsetA = offsetA! + indexDataA;
        const wouldBeNextPageOffsetB = offsetB! + indexDataB;
        nextPageOffsetA =
            wouldBeNextPageOffsetA < dataA.totalCount
                ? wouldBeNextPageOffsetA
                : undefined;
        nextPageOffsetB =
            wouldBeNextPageOffsetB < dataB.totalCount
                ? wouldBeNextPageOffsetB
                : undefined;
    }

    console.debug("Merged data", {
        data: resData,
        nextPageParam: {
            nextPageFormManagerOffset: nextPageOffsetA,
            nextPageAssignerOffset: nextPageOffsetB,
        },
    });

    return {
        resData,
        nextPageOffsetA: nextPageOffsetA,
        nextPageOffsetB: nextPageOffsetB,
    };
}

/**
 * Access a nested value in an object based on string path.
 * @param obj - The object to extract the value from.
 * @param path - The path to the value, e.g. "a.b.c".
 */
function accessNestedValue(obj: unknown, path: string): unknown {
    let value = obj as any;
    for (const key of path.split(".")) {
        if (typeof value === "object" && value !== null && key in value)
            value = value[key];
        else {
            value = null;
            break;
        }
    }
    return value;
}
