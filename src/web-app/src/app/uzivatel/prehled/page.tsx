import { Metadata } from "next";
import CurrentUserDetails from "./CurrentUserDetails";
import LogoutButton from "./LogoutButton";
import TaskTable from "./TaskTable";

export const metadata: Metadata = {
    title: "Přehled",
};

/**
 * Prehled (dashboard) page for clients/patients.
 */
export default function PrehledPage() {
    return (
        <main>
            <h1>Přehled</h1>
            <CurrentUserDetails />
            <LogoutButton />
            <TaskTable />
        </main>
    );
}
