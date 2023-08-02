import { Metadata } from "next";
import CreateForm from "./CreateForm";

export const metadata: Metadata = {
    title: "Vytvořit formulář",
};

/**
 * Page for creating a new form.
 */
export default function CreateFormPage() {
    return (
        <>
            <h1>Vytvořit formulář</h1>
            <CreateForm />
        </>
    );
}
