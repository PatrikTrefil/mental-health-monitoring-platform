import { Metadata } from "next";
import FormManagement from "./FormManagement";

export const metadata: Metadata = {
    title: "Přehled",
};

/**
 * Prehled (dashboard) page for employees.
 */
export default function PrehledPage() {
    return (
        <main>
            <h1>Správa formulářů</h1>
            <FormManagement />
        </main>
    );
}
