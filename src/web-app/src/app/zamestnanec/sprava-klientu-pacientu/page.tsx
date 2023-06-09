import { Metadata } from "next";
import ClientPatientTable from "./ClientPatientTable";

export const metadata: Metadata = {
    title: "Správa klientů a pacientů",
};

export default function SpravaKlientuPacientuPage() {
    return (
        <>
            <h1>Správa klientů/pacientů</h1>
            <ClientPatientTable />
        </>
    );
}
