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
    }: {
        formioToken: string;
        pagination: { limit: number; offset: number };
        sort?: { field: keyof Form; order: "asc" | "desc" };
        tags?: string[];
    }) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ["formsList", tags, pagination, sort],
        queryFn: () => loadForms({ formioToken, pagination, sort, tags }),
    }),
    detail: (formioToken: string, formId: string) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: [formId],
        queryFn: () => loadFormById(formId, formioToken),
    }),
    submissions: (formioToken: string, formPath: string) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ["submissions", formPath],
        queryFn: () => loadSubmissions(formPath, formioToken),
    }),
});
