import CurrentUserDetails from "@/components/shared/CurrentUserDetails";
import { FormList } from "@/components/shared/FormList";
import LogoutButton from "@/components/shared/LogoutButton";
import { Metadata } from "next";
import UserFormLine from "./UserFormLine";

export const metadata: Metadata = {
    title: "Přehled",
};

/**
 * Prehled (dashboard) page for clients/patients.
 */
export default function PrehledPage() {
    return (
        <main>
            <h1>Přehled</h1>
            <CurrentUserDetails />
            <LogoutButton />
            <h2>Seznam formulářů k vyplnění</h2>
            <FormList
                filterOptions={{
                    tags: "klientPacient",
                }}
                FormLine={UserFormLine}
            />
        </main>
    );
}
