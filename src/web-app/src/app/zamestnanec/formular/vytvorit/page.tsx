import { Metadata } from "next";
import CreateForm from "./CreateForm";

export const metadata: Metadata = {
    title: "Vytvořit formulář",
};

export default function CreateFormPage() {
    return (
        <>
            <h1>Vytvořit formulář</h1>
            <CreateForm />
        </>
    );
}
