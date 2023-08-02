import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
    loadClientPatient,
    loadEmployees,
    loadRoles,
} from "../userManagementClient";

export const usersQuery = createQueryKeys("users", {
    list: (formioToken: string) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ["usersList"],
        queryFn: () => loadClientPatient(formioToken),
    }),
    detail: (formioToken: string, userSubmissionId: string) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: [userSubmissionId],
        queryFn: () => loadClientPatient(formioToken, userSubmissionId),
    }),
});

export const employeesQuery = createQueryKeys("employees", {
    list: (formioToken: string) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ["employeesList"],
        queryFn: () => loadEmployees(formioToken),
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
