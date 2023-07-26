import { createQueryKeys } from "@lukemorales/query-key-factory";
import { loadEmployees, loadUser, loadUsers } from "../userManagementClient";

export const usersQuery = createQueryKeys("users", {
    list: (formioToken: string, callerId: string) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: [callerId],
        queryFn: () => loadUsers(formioToken),
    }),
});

export const employeesQuery = createQueryKeys("employees", {
    list: (formioToken: string, callerId: string) => ({
        // We don't include the token in the query key, because the result does not depend on it
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: [callerId],
        queryFn: () => loadEmployees(formioToken),
    }),
});
