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
        <>
            <h1>Správa formulářů</h1>
            <FormDefinitionsTable />
        </>
    );
}
