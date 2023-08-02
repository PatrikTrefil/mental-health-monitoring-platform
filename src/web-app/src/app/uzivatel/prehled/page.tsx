import { Metadata } from "next";
import TaskTable from "./TaskTable";

export const metadata: Metadata = {
    title: "Přehled",
};

/**
 * Dashboard page for clients/patients.
 */
export default function PrehledPage() {
    return (
        <main>
            <h1>Přehled</h1>
            <TaskTable />
        </main>
    );
}
