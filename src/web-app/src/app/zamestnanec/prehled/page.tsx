import { Metadata } from "next";
import FormDefinitionsTable from "./FormDefinitionsTable";

export const metadata: Metadata = {
    title: "Přehled",
};

/**
 * Prehled (dashboard) page for employees.
 */
export default function PrehledPage() {
    return (
        <main>
            <h1>Přehled</h1>
            <div>
                <h2>Definice formulářů</h2>
                <FormDefinitionsTable />
            </div>
        </main>
    );
}
