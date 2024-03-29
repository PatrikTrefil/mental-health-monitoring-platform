import { Metadata } from "next";
import EmployeeTable from "./EmployeeTable";

export const metadata: Metadata = {
    title: "Správa zaměstnanců",
};

/**
 * Employee management page.
 */
export default function SpravaZamestnancuPage() {
    return (
        <>
            <h1>Správa zaměstnanců</h1>
            <EmployeeTable />
        </>
    );
}
