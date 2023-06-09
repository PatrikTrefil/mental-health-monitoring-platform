import { Metadata } from "next";
import TaskManagement from "./TaskManagement";

export const metadata: Metadata = {
    title: "Zadávání úkolů",
};

/**
 * Page for managing tasks of users.
 */
export default function SpravaUkoluPage() {
    return (
        <main>
            <TaskManagement />
        </main>
    );
}
