import { createQueryKeys } from "@lukemorales/query-key-factory";
import { loadFormById, loadForms } from "../formManagementClient";

export const formsQuery = createQueryKeys("forms", {
    list: (
        formioToken: string,
        pagination: { limit: number; offset: number },
        tags?: string[]
    ) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ["formsList", tags, pagination],
        queryFn: () => loadForms(formioToken, pagination, tags),
    }),
    detail: (formioToken: string, formId: string) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: [formId],
        queryFn: () => loadFormById(formId, formioToken),
    }),
});
