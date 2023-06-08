import CurrentUserDetails from "@/components/shared/CurrentUserDetails";
import LogoutButton from "@/components/shared/LogoutButton";
import { Metadata } from "next";
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
