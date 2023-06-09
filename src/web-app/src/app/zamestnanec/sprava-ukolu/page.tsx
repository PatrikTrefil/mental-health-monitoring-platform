import { Metadata } from "next";
import TaskManagement from "./TaskManagement";

export const metadata: Metadata = {
    title: "Správa úkolů",
};

/**
 * Page for managing tasks of users.
 */
export default function SpravaUkoluPage() {
    return (
        <main>
            <h1>Správa úkolů</h1>
            <TaskManagement />
        </main>
    );
}
