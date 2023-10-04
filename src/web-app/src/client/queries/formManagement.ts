import { Form } from "@/types/formManagement/forms";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
    loadFormById,
    loadForms,
    loadSubmissions,
} from "../formManagementClient";

export const formsQuery = createQueryKeys("forms", {
    list: ({
        formioToken,
        pagination,
        sort,
        tags,
        filters,
    }: {
        formioToken: string;
        pagination: { limit: number; offset: number };
        sort?: { field: keyof Form; order: "asc" | "desc" };
        tags?: string[];
        filters?: {
            fieldPath: string;
            operation: "contains";
            comparedValue: string;
        }[];
    }) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ["formsList", tags, pagination, sort, filters],
        queryFn: () =>
            loadForms({ formioToken, pagination, sort, tags, filters }),
    }),
    detail: (formioToken: string, formId: string) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: [formId],
        queryFn: () => loadFormById(formId, formioToken),
    }),
    submissions: (
        formId: string,
        {
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
        }
    ) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ["submissions", formId, pagination, sort, filters],
        queryFn: () =>
            loadSubmissions(formId, { formioToken, pagination, sort, filters }),
    }),
});
