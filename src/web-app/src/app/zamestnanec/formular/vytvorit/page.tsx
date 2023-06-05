import { Metadata } from "next";
import ClientCreateFormPage from "./ClientCreateFormPage";

export const metadata: Metadata = {
    title: "Vytvořit formulář",
};

export default function CreateFormPage() {
    return <ClientCreateFormPage />;
}