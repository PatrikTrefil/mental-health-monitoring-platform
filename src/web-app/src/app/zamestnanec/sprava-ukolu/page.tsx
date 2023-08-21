import { Metadata } from "next";
import TaskTable from "./TaskTable";

export const metadata: Metadata = {
    title: "Správa úkolů",
};

/**
 * Page for managing tasks of users.
 */
export default function SpravaUkoluPage() {
    return (
        <>
            <h1>Správa úkolů</h1>
            <TaskTable />
        </>
    );
}
