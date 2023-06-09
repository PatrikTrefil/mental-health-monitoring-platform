import { Metadata } from "next";
import TaskManagement from "./TaskManagement";

export const metadata: Metadata = {
    title: "Zadávání úkolů",
};

export default function SpravaUkoluPage() {
    return (
        <main>
            <TaskManagement />
        </main>
    );
}
