import { Metadata } from "next";
import AssigneeTable from "./AssigneeTable";

export const metadata: Metadata = {
    title: "Správa klientů a pacientů",
};

/**
 * Page for managing accounts of assignees.
 */
export default function AssigneeManagementPage() {
    return (
        <>
            <h1>Správa klientů/pacientů</h1>
            <AssigneeTable />
        </>
    );
}
