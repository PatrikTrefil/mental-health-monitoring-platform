import { Metadata } from "next";
import TaskCreationForm from "./TaskCreationForm";

export const metadata: Metadata = {
    title: "Nový úkol",
};

/**
 * Page for creating new tasks.
 */
export default function NovyUkolPage() {
    return (
        <>
            <h1>Nový úkol</h1>
            <TaskCreationForm />
        </>
    );
}
