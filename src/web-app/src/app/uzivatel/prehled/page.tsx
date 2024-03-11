import { Metadata } from "next";
import TaskTable from "./TaskTable";

export const metadata: Metadata = {
    title: "Přehled",
};

/**
 * Dashboard page for users.
 */
export default function DashboardPage() {
    return (
        <main>
            <h1>Přehled</h1>
            <TaskTable />
        </main>
    );
}
